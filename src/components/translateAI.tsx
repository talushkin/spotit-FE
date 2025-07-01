// NEVER expose real keys in production apps or public sandboxes
import axios from "axios";

const BASE_URL = "https://be-tan-theta.vercel.app";
const API_KEY = process.env.REACT_APP_TRANSLATE_API_KEY; // Read from .env

export const translateDirectly = async (text: string, toLang: string = "en"): Promise<string> => {
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
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res?.data?.translatedText || text;
  } catch (err: any) {
    console.error("Error translating text:", err.response?.data || err.message);
    return text;
  }
};
