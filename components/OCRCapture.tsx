
import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { extractLicensePlate, optimizeImage } from '../services/geminiService';
import { Button } from './ui/Button';

interface OCRCaptureProps {
  onScanComplete: (text: string) => void;
  label?: string;
}

// Added React import to resolve "Cannot find namespace 'React'" for React.FC
export const OCRCapture: React.FC<OCRCaptureProps> = ({ onScanComplete, label = "Chụp hình" }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Added React import to resolve "Cannot find namespace 'React'" for React.ChangeEvent
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      
      // Step 1: Optimize image (resize and compress) locally to avoid massive uploads
      const optimized = await optimizeImage(file);
      
      // Step 2: Send optimized smaller payload to Gemini
      const extractedText = await extractLicensePlate(optimized.data, optimized.mimeType);
      
      if (extractedText) {
        onScanComplete(extractedText);
      } else {
        alert("Không tìm thấy biển số xe rõ ràng. Vui lòng chụp gần và rõ hơn.");
      }
    } catch (error: any) {
      console.error("Capture Error:", error);
      const errorMessage = error.message?.includes("API Key") 
        ? "Lỗi cấu hình hệ thống (API Key). Vui lòng báo quản trị viên."
        : "Lỗi kết nối hoặc xử lý ảnh. Vui lòng thử lại với mạng ổn định hơn.";
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
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
        onClick={triggerCamera}
        isLoading={isProcessing}
        className="!p-2 aspect-square rounded-lg relative overflow-hidden"
        title={label}
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
