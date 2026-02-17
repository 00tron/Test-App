
import { GoogleGenAI, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const getSpiritualInspiration = async (mantra: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a short, deeply spiritual inspiration or historical meaning for the mantra: "${mantra}". 
      Also include a short encouraging quote for someone who is practicing this meditation.
      Keep it brief and beautiful.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meaning: { type: Type.STRING, description: "The deep spiritual meaning of the mantra." },
            quote: { type: Type.STRING, description: "A short encouraging quote for the practitioner." }
          },
          required: ["meaning", "quote"]
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text.trim());
    }
    return null;
  } catch (error) {
    console.error("Error fetching inspiration:", error);
    return null;
  }
};
