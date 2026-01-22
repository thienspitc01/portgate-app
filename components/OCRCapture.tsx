
import React, { useRef, useState } from 'react';
import { Camera, Loader2 } from 'lucide-react';
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
      
      if (extractedText && extractedText.length > 3) {
        onScanComplete(extractedText);
      } else {
        alert("⚠️ Không nhận diện được biển số.\n\nMẹo: Hãy chụp gần hơn, giữ thẳng camera và đảm bảo đủ ánh sáng.");
      }
    } catch (error: any) {
      console.error("OCR Process Error:", error);
      // Guidelines state that the app must not prompt users for API keys. 
      // Assuming availability of API_KEY is handled by the deployment environment.
      alert(`❌ Lỗi kết nối AI: ${error.message || "Vui lòng thử lại sau"}`);
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
        className="!p-3 aspect-square rounded-xl shadow-sm border-blue-100 hover:border-blue-300 transition-all"
      >
        {isProcessing ? (
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        ) : (
          <Camera className="w-6 h-6 text-blue-500" />
        )}
      </Button>
    </>
  );
};
