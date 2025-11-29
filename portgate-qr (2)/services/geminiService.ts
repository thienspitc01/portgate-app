import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Extracts license plate number from an image using Gemini Vision.
 */
export const extractLicensePlate = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // We use gemini-2.5-flash-image for fast image processing
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract the vehicle license plate number from this image. Return ONLY the alphanumeric characters (uppercase) with no spaces, dashes, or special characters. If multiple plates are visible, return the most prominent one. If no plate is found, return empty string.",
          },
        ],
      },
    });

    const text = response.text?.trim() || "";
    // Post-processing to ensure clean output (remove any lingering spaces or dashes)
    return text.replace(/[^A-Z0-9]/g, '');
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw new Error("Không thể nhận diện biển số. Vui lòng thử lại.");
  }
};

export const convertBlobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};