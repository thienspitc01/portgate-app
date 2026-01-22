
import { GoogleGenAI } from "@google/genai";

/**
 * Tối ưu hóa hình ảnh (giảm kích thước và nén) để hoạt động ổn định trên mạng di động.
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
        if (!ctx) return reject(new Error("Không thể khởi tạo canvas"));
        
        ctx.drawImage(img, 0, 0, width, height);
        // Nén JPEG 70% giúp giảm dung lượng cực lớn từ camera điện thoại
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        const base64 = dataUrl.split(',')[1];
        resolve({ data: base64, mimeType: 'image/jpeg' });
      };
      img.onerror = () => reject(new Error("Lỗi tải ảnh"));
    };
    reader.onerror = () => reject(new Error("Lỗi đọc file"));
  });
};

/**
 * Trích xuất biển số xe bằng Gemini 3 Flash.
 */
export const extractLicensePlate = async (base64Data: string, mimeType: string): Promise<string> => {
  // Kiểm tra API Key ngay tại thời điểm gọi
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'PLACEHOLDER_API_KEY') {
    throw new Error("API_KEY_MISSING: Chưa cấu hình API Key trên Vercel.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Extract the vehicle license plate number. Return ONLY the alphanumeric characters (uppercase) with no spaces. If no plate found, return empty." }
        ],
      },
    });

    const text = response.text?.trim() || "";
    return text.replace(/[^A-Z0-9]/g, '');
  } catch (error: any) {
    console.error("Gemini Error:", error);
    throw new Error(error.message || "Lỗi xử lý AI");
  }
};
