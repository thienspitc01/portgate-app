
import React, { useRef, useState } from 'react';
import { Camera, Loader2, AlertCircle } from 'lucide-react';
import { extractLicensePlate, optimizeImage } from '../services/geminiService';
import { Button } from './ui/Button';

interface OCRCaptureProps {
  onScanComplete: (text: string) => void;
  label?: string;
}

export const OCRCapture: React.FC<OCRCaptureProps> = ({ onScanComplete, label = "Chụp hình" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      const optimized = await optimizeImage(file);
      const extractedText = await extractLicensePlate(optimized.data, optimized.mimeType);
      
      if (extractedText) {
        onScanComplete(extractedText);
      } else {
        alert("Không nhận diện được biển số. Hãy chụp gần và rõ hơn.");
      }
    } catch (error: any) {
      console.error("OCR Error:", error);
      
      if (error.message?.includes("API_KEY_MISSING")) {
        alert("⚠️ THIẾU CẤU HÌNH:\nBạn cần vào Vercel Dashboard -> Settings -> Environment Variables và thêm biến 'API_KEY' với mã Gemini của bạn, sau đó Redeploy.");
      } else {
        alert(`Lỗi: ${error.message || "Không thể kết nối máy chủ AI"}`);
      }
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <Button 
        type="button" 
        variant="secondary" 
        onClick={() => fileInputRef.current?.click()}
        isLoading={isProcessing}
        className="!p-2 aspect-square rounded-lg relative"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
        ) : (
          <Camera className="w-5 h-5 text-gray-600" />
        )}
      </Button>
    </>
  );
};
