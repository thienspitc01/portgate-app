import React, { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import { PlateData } from '../types';
import { Input } from '../components/ui/Input';
import { OCRCapture } from '../components/OCRCapture';
import { Truck, Container } from 'lucide-react';

const STORAGE_KEY = 'portgate_last_plate_data';

export const DriverView: React.FC = () => {
  const [data, setData] = useState<PlateData>({ truck: '', mooc: '' });
  
  // Load last used data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  // Save to local storage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const handleTruckOCR = (text: string) => {
    setData(prev => ({ ...prev, truck: text }));
  };

  const handleMoocOCR = (text: string) => {
    setData(prev => ({ ...prev, mooc: text }));
  };

  // Generate a simple pipe-delimited string for the QR code to keep it small and fast to scan
  // Format: T:NUMBER|M:NUMBER
  const qrValue = `T:${data.truck.toUpperCase().trim()}|M:${data.mooc.toUpperCase().trim()}`;
  
  const hasData = data.truck || data.mooc;

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Truck className="w-6 h-6 mr-2 text-blue-600" />
          Thông tin xe
        </h2>
        
        <div className="space-y-4">
          <Input
            label="Biển số Đầu Kéo"
            placeholder="VD: 51C12345"
            value={data.truck}
            onChange={(e) => setData({ ...data, truck: e.target.value.toUpperCase() })}
            rightElement={<OCRCapture onScanComplete={handleTruckOCR} label="Chụp đầu kéo" />}
          />
          
          <Input
            label="Biển số Rơ Mooc"
            placeholder="VD: 51R99999"
            value={data.mooc}
            onChange={(e) => setData({ ...data, mooc: e.target.value.toUpperCase() })}
            rightElement={<OCRCapture onScanComplete={handleMoocOCR} label="Chụp rơ mooc" />}
            icon={<Container className="w-5 h-5" />}
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">Mã QR Định Danh</h2>
        
        {hasData ? (
          <div className="p-4 bg-white border-2 border-gray-900 rounded-xl">
             <QRCode 
                value={qrValue} 
                size={220}
                level="M"
                viewBox={`0 0 256 256`}
             />
          </div>
        ) : (
          <div className="text-center text-gray-400 py-10">
            <p>Nhập thông tin xe để tạo mã QR</p>
          </div>
        )}
        
        <p className="mt-6 text-sm text-gray-500 text-center max-w-xs">
          Đưa mã này cho nhân viên cổng cảng để quét thông tin tự động.
        </p>
      </div>
    </div>
  );
};