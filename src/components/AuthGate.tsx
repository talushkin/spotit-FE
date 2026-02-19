import React, { useEffect, useMemo, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  picture?: string;
}

interface AuthGateProps {
  onAuthSuccess: (user: AuthUser) => void;
  onSkip?: () => void;
}

const REFRESH_TOKEN_COOKIE = "spotit_refresh_token";
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return null;
  return decodeURIComponent(cookie.substring(name.length + 1));
}

function splitFirstAndLastName(fullName: string, email: string): { firstName: string; lastName: string } {
  const cleaned = (fullName || "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(" "),
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],
      lastName: "",
    };
  }

  const emailPrefix = (email || "").split("@")[0] || "User";
  return { firstName: emailPrefix, lastName: "" };
}

export function parseAuthUserFromGoogleToken(token: string): AuthUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.sub || !payload?.email) return null;

  const displayName = payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim();
  const firstName = payload.given_name || splitFirstAndLastName(displayName, payload.email).firstName;
  const lastName = payload.family_name || splitFirstAndLastName(displayName, payload.email).lastName;

  return {
    id: payload.sub,
    name: displayName || firstName,
    firstName,
    lastName,
    email: payload.email,
    picture: payload.picture,
  };
}

export function saveRefreshTokenCookie(token: string) {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Max-Age=${REFRESH_TOKEN_MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

export function clearRefreshTokenCookie() {
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}

export function getAuthUserFromRefreshTokenCookie(): AuthUser | null {
  const token = readCookie(REFRESH_TOKEN_COOKIE);
  if (!token) return null;
  return parseAuthUserFromGoogleToken(token);
}

export default function AuthGate({ onAuthSuccess, onSkip }: AuthGateProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState<string>("");

  const clientId = useMemo(() => process.env.REACT_APP_GOOGLE_CLIENT_ID || "", []);

  useEffect(() => {
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    ) as HTMLScriptElement | null;

    if (existing) {
      if ((window as any).google?.accounts?.id) {
        setScriptReady(true);
      } else {
        existing.addEventListener("load", () => setScriptReady(true), { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError("Failed to load Google auth script.");
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!scriptReady) return;
    if (!clientId) {
      setError("Missing REACT_APP_GOOGLE_CLIENT_ID in environment.");
      return;
    }

    const googleApi = (window as any).google;
    if (!googleApi?.accounts?.id) {
      setError("Google Identity API is unavailable.");
      return;
    }

    googleApi.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        const credential = response?.credential;
        if (!credential) {
          setError("Google login did not return a credential.");
          return;
        }

        const user = parseAuthUserFromGoogleToken(credential);
        if (!user) {
          setError("Invalid Google profile payload.");
          return;
        }

        saveRefreshTokenCookie(credential);
        onAuthSuccess(user);
      },
    });

    const buttonContainer = document.getElementById("google-signin-button");
    if (!buttonContainer) return;

    buttonContainer.innerHTML = "";
    googleApi.accounts.id.renderButton(buttonContainer, {
      theme: "outline",
      size: "large",
      text: mode === "signin" ? "signin_with" : "signup_with",
      shape: "pill",
      width: 260,
    });
  }, [scriptReady, clientId, mode, onAuthSuccess]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0b0b0b",
        color: "#fff",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 16,
          padding: 24,
          background: "#171717",
          border: "1px solid #2c2c2c",
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Spot.it</div>
        <div style={{ color: "#b4b4b4", marginBottom: 20 }}>
          {mode === "signin" ? "Sign in to continue" : "Create your account to continue"}
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
          <button
            onClick={() => setMode("signin")}
            style={{
              flex: 1,
              borderRadius: 999,
              padding: "10px 12px",
              border: mode === "signin" ? "1px solid #fff" : "1px solid #3a3a3a",
              background: mode === "signin" ? "#272727" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => setMode("signup")}
            style={{
              flex: 1,
              borderRadius: 999,
              padding: "10px 12px",
              border: mode === "signup" ? "1px solid #fff" : "1px solid #3a3a3a",
              background: mode === "signup" ? "#272727" : "transparent",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Sign up
          </button>
        </div>

        <div id="google-signin-button" style={{ minHeight: 44 }} />

        <button
          type="button"
          onClick={() => onSkip?.()}
          style={{
            width: "100%",
            marginTop: 12,
            borderRadius: 999,
            padding: "10px 12px",
            border: "1px solid #3a3a3a",
            background: "transparent",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Skip (continue as unidentified)
        </button>

        {error && <div style={{ color: "#ff9292", marginTop: 12 }}>{error}</div>}
      </div>
    </div>
  );
}
