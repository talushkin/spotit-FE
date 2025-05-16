// NEVER expose real keys in production apps or public sandboxes
import axios from "axios";

const BASE_URL = "https://be-tan-theta.vercel.app";

export const generateImage = async (text) => {
  if (!text) {
    console.warn("Image description is missing");
    return text;
  }

  try {
    console.log("Requesting image for:", text);
    const res = await axios.post(
      `${BASE_URL}/api/ai/image`,
      { text: text },
      {
        headers: {
          Authorization: `Bearer 1234`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("image result:", res.data);
    return res?.data?.s3Url || res?.data?.imageUrl || null; // Return the image URL or fallback to null
  } catch (err) {
    console.error("Error creating image:", err.response?.data || err.message);
    return text; // Return original text on error
  }
};
