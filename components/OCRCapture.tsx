import React, { useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { extractLicensePlate, convertBlobToBase64 } from '../services/geminiService';
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
      const base64 = await convertBlobToBase64(file);
      const extractedText = await extractLicensePlate(base64, file.type);
      
      if (extractedText) {
        onScanComplete(extractedText);
      } else {
        alert("Không tìm thấy biển số xe rõ ràng. Vui lòng thử lại.");
      }
    } catch (error) {
      alert("Lỗi khi xử lý hình ảnh. Vui lòng kiểm tra kết nối mạng.");
      console.error(error);
    } finally {
      setIsProcessing(false);
      // Reset input so same file can be selected again if needed
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
        className="!p-2 aspect-square rounded-lg"
        title={label}
      >
        {!isProcessing && <Camera className="w-5 h-5 text-gray-600" />}
      </Button>
    </>
  );
};