
import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Resizes and compresses an image to improve reliability and speed on mobile devices.
 */
export const optimizeImage = (file: File, maxWidth = 1024, maxHeight = 1024): Promise<{ data: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error("Could not get canvas context"));
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Export as JPEG with 70% quality to significantly reduce payload size
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = dataUrl.split(',')[1];
        resolve({ data: base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error("Failed to load image for resizing"));
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

/**
 * Extracts license plate number from an optimized image using Gemini.
 */
export const extractLicensePlate = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = getClient();
    
    // Using gemini-3-flash-preview for the best multimodal performance (OCR)
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
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
    // Post-processing to ensure clean output
    return text.replace(/[^A-Z0-9]/g, '');
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    throw error;
  }
};
