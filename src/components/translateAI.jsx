// NEVER expose real keys in production apps or public sandboxes
import axios from "axios";

const BASE_URL = "https://be-tan-theta.vercel.app";

export const translateDirectly = async (text, toLang = "en") => {
  if (!text || !toLang) {
    console.warn("Text or target language is missing");
    return text;
  }

  try {
    const res = await axios.post(
      `${BASE_URL}/api/ai/translate`,
      {
        text: text,
        targetLanguage: toLang,
      },
      {
        headers: {
          Authorization: `Bearer 1234`,
          "Content-Type": "application/json",
        },
      }
    );
    return res?.data?.translatedText || text;
  } catch (err) {
    console.error("Error translating text:", err.response?.data || err.message);
    return text;
  }
};
