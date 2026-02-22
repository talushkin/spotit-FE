export const queueVideoIdToDrive = async (videoId: string): Promise<void> => {
  const trimmedVideoId = (videoId || "").trim();
  if (!trimmedVideoId) {
    throw new Error("Missing videoId");
  }

  const response = await fetch("/api/queue-song", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ videoId: trimmedVideoId }),
  });

  if (!response.ok) {
    let message = `Bridge request failed (${response.status})`;
    try {
      const body = (await response.json()) as { error?: string };
      if (body?.error) {
        message = body.error;
      }
    } catch {
      // ignore JSON parse issues
    }
    throw new Error(message);
  }
};
