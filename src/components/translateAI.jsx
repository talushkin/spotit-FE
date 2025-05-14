// NEVER expose real keys in production apps or public sandboxes
import axios from "axios";


export const translateDirectly = async (text, toLang = "en") => {
  if (!text || !toLang) {
    console.warn("Text or target language is missing");
    return text;
  }

  try {
    ///console.log("Requesting translation for:", text, "to:", toLang);
    const res = await axios.post("http://localhost:5000/api/ai/translate", {
      text: text,
      targetLanguage: toLang, // Send data in the body
    }, {
      headers: {
        Authorization: `Bearer 1234`,
        "Content-Type": "application/json",
      },
    });
    //console.log("Translation result:", res.data);
    return res?.data?.translatedText || text; // Return the translated text or fallback to original text
  } catch (err) {
    console.error("Error translating text:", err.response?.data || err.message);
    return text; // Return original text on error
  }
};
