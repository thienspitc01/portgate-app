
import { GoogleGenAI } from "@google/genai";

/**
 * Nén và tối ưu ảnh để giảm băng thông (quan trọng cho 4G yếu tại cảng)
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
        if (!ctx) return reject(new Error("Canvas context failed"));
        
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        const base64 = dataUrl.split(',')[1];
        resolve({ data: base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error("Image load failed"));
    };
    reader.onerror = () => reject(new Error("File read failed"));
  });
};

/**
 * Trích xuất biển số xe bằng Gemini 3 Flash với prompt tối ưu cho Việt Nam
 */
export const extractLicensePlate = async (base64Data: string, mimeType: string): Promise<string> => {
  // Always initialize with apiKey from process.env.API_KEY right before the call.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Phân tích hình ảnh biển số xe Việt Nam này. Trích xuất số biển số xe (ví dụ: 51C12345, 51R01234, 15H00123). Loại bỏ tất cả dấu chấm, dấu gạch ngang và khoảng cách. Chỉ trả về chuỗi ký tự chữ và số viết hoa. Nếu không thấy biển số rõ ràng, trả về chuỗi rỗng." }
        ],
      },
    });

    // Access .text property directly as per guidelines.
    const result = response.text?.trim() || "";
    return result.replace(/[^A-Z0-9]/g, '');
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
