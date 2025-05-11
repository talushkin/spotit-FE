// NEVER expose real keys in production apps or public sandboxes
const OPENAI_API_KEY =
  "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"; // use your key cautiously

export const translateDirectly = async (text, toLang = "en") => {
  const prompt = `Translate the following text to ${toLang}:\n"${text}"`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  let result = data.choices[0]?.message?.content?.trim() || text;

  // Strip surrounding quotes if present
  if (result.startsWith('"') && result.endsWith('"')) {
    result = result.slice(1, -1);
  }

  return result;
};
