const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DEFAULT_DRIVE_FOLDER_ID = "1cTp1M9V7vNEQuVyYifUW01Gwgu2uw1Vv";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
};

type GoogleTokenClient = {
  callback: (response: GoogleTokenResponse) => void;
  requestAccessToken: (options?: { prompt?: string }) => void;
};

let tokenClient: GoogleTokenClient | null = null;
let accessToken = "";
let accessTokenExpiresAt = 0;

const readEnv = (key: string) => {
  const raw = (process.env as Record<string, string | undefined>)[key];
  return (raw || "").trim();
};

const getGoogleClientId = () => {
  const envClientId = readEnv("REACT_APP_GOOGLE_CLIENT_ID");
  if (envClientId) return envClientId;
  return "";
};

const getDriveFolderId = () => {
  const envFolderId = readEnv("REACT_APP_GOOGLE_DRIVE_FOLDER_ID");
  return envFolderId || DEFAULT_DRIVE_FOLDER_ID;
};

const getDriveFilename = (videoId: string) => `${videoId}.txt`;

const ensureGoogleIdentityScript = async (): Promise<void> => {
  const globalWindow = window as any;
  if (globalWindow.google?.accounts?.oauth2) return;

  const existingScript = document.querySelector(
    'script[src="https://accounts.google.com/gsi/client"]'
  ) as HTMLScriptElement | null;

  if (existingScript) {
    await new Promise<void>((resolve, reject) => {
      if ((window as any).google?.accounts?.oauth2) {
        resolve();
        return;
      }
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Identity script.")), { once: true });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity script."));
    document.body.appendChild(script);
  });
};

const getTokenClient = async (): Promise<GoogleTokenClient> => {
  await ensureGoogleIdentityScript();
  if (tokenClient) return tokenClient;

  const clientId = getGoogleClientId();
  if (!clientId) {
    throw new Error("Missing REACT_APP_GOOGLE_CLIENT_ID.");
  }

  const googleApi = (window as any).google;
  if (!googleApi?.accounts?.oauth2?.initTokenClient) {
    throw new Error("Google OAuth token client is unavailable.");
  }

  tokenClient = googleApi.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: DRIVE_SCOPE,
    callback: () => {},
  }) as GoogleTokenClient;

  return tokenClient;
};

const getDriveAccessToken = async (): Promise<string> => {
  if (accessToken && Date.now() < accessTokenExpiresAt - 10_000) {
    return accessToken;
  }

  const client = await getTokenClient();
  const needsConsentPrompt = !accessToken;

  const token = await new Promise<string>((resolve, reject) => {
    client.callback = (response: GoogleTokenResponse) => {
      if (response?.error) {
        reject(new Error(response.error));
        return;
      }
      if (!response?.access_token) {
        reject(new Error("No access token returned by Google."));
        return;
      }

      accessToken = response.access_token;
      const expiresIn = Number(response.expires_in || 3600);
      accessTokenExpiresAt = Date.now() + expiresIn * 1000;
      resolve(accessToken);
    };

    client.requestAccessToken({ prompt: needsConsentPrompt ? "consent" : "" });
  });

  return token;
};

const escapeDriveQuery = (value: string) => value.replace(/'/g, "\\'");

const findExistingFileId = async (token: string, folderId: string, filename: string): Promise<string | null> => {
  const q = `name='${escapeDriveQuery(filename)}' and '${escapeDriveQuery(folderId)}' in parents and trashed=false`;
  const params = new URLSearchParams({
    q,
    fields: "files(id,name)",
    pageSize: "1",
    supportsAllDrives: "true",
    includeItemsFromAllDrives: "true",
  });

  const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Drive lookup failed (${response.status}).`);
  }

  const json = (await response.json()) as { files?: Array<{ id?: string }> };
  return json.files?.[0]?.id || null;
};

const updateFileContent = async (token: string, fileId: string, content: string): Promise<void> => {
  const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media&supportsAllDrives=true`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain; charset=utf-8",
    },
    body: content,
  });

  if (!response.ok) {
    throw new Error(`Drive update failed (${response.status}).`);
  }
};

const createFile = async (token: string, folderId: string, filename: string, content: string): Promise<void> => {
  const metadata = {
    name: filename,
    parents: [folderId],
    mimeType: "text/plain",
  };

  const boundary = `spotit-${Date.now()}`;
  const body =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: text/plain; charset=UTF-8\r\n\r\n` +
    `${content}\r\n` +
    `--${boundary}--`;

  const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Drive create failed (${response.status}).`);
  }
};

export const saveVideoIdToDriveTextFile = async (videoId: string): Promise<void> => {
  const trimmedVideoId = (videoId || "").trim();
  if (!trimmedVideoId) {
    throw new Error("Missing videoId.");
  }

  const folderId = getDriveFolderId();
  const filename = getDriveFilename(trimmedVideoId);
  const token = await getDriveAccessToken();
  const existingFileId = await findExistingFileId(token, folderId, filename);

  if (existingFileId) {
    await updateFileContent(token, existingFileId, trimmedVideoId);
    return;
  }

  await createFile(token, folderId, filename, trimmedVideoId);
};
