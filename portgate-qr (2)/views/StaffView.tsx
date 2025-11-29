import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ScanResult } from '../types';
import { Button } from '../components/ui/Button';
import { Copy, CheckCircle, RefreshCw, XCircle } from 'lucide-react';

export const StaffView: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleScan = (result: string) => {
    if (result) {
      try {
        // Expected format: T:TRUCKNUM|M:MOOCNUM
        const parts = result.split('|');
        let truck = null;
        let mooc = null;

        parts.forEach(part => {
          if (part.startsWith('T:')) truck = part.substring(2);
          if (part.startsWith('M:')) mooc = part.substring(2);
        });

        // Fallback for simple JSON if format changes later
        if (!truck && !mooc && result.startsWith('{')) {
             const json = JSON.parse(result);
             truck = json.truck;
             mooc = json.mooc;
        }

        if (truck || mooc) {
          setScanResult({ truck, mooc, raw: result });
          setIsScanning(false);
          // Play a success beep
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
          audio.volume = 0.5;
          audio.play().catch(e => console.log('Audio play failed', e));
        }
      } catch (e) {
        console.error("Parse error", e);
      }
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const resetScanner = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
        <h2 className="text-lg font-bold text-gray-800">Quét xe vào cổng</h2>
        <p className="text-sm text-gray-500">Hướng camera vào mã QR của tài xế</p>
      </div>

      {isScanning ? (
        <div className="flex-1 bg-black rounded-2xl overflow-hidden relative shadow-lg">
           <Scanner 
              onScan={(results) => {
                if (results && results.length > 0) {
                  handleScan(results[0].rawValue);
                }
              }}
              onError={(error) => console.log(error)}
              components={{
                audio: false, // We handle audio manually for better control
                torch: true,
                count: false,
                onOff: false,
                tracker: false,
              }}
              styles={{
                container: { height: '100%' }
              }}
          />
          <div className="absolute inset-0 border-2 border-blue-500/50 pointer-events-none flex items-center justify-center">
             <div className="w-64 h-64 border-2 border-blue-400 rounded-lg bg-blue-500/10 backdrop-blur-[2px]"></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {scanResult ? (
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
               <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold text-lg flex items-center">
                   <CheckCircle className="w-6 h-6 mr-2" /> Kết quả quét
                 </h3>
                 <span className="text-xs bg-blue-500 px-2 py-1 rounded text-blue-100">Thành công</span>
               </div>
               
               <div className="p-6 space-y-6">
                 {/* Truck Section */}
                 <div>
                   <label className="text-sm font-medium text-gray-500 mb-1 block">Số xe đầu kéo</label>
                   <div className="flex gap-2">
                     <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-xl font-mono font-bold text-gray-800 tracking-wider">
                       {scanResult.truck || "---"}
                     </div>
                     <Button 
                        disabled={!scanResult.truck}
                        onClick={() => scanResult.truck && copyToClipboard(scanResult.truck, 'truck')}
                        variant={copiedField === 'truck' ? 'primary' : 'secondary'}
                        className="w-14"
                     >
                       {copiedField === 'truck' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                     </Button>
                   </div>
                 </div>

                 {/* Mooc Section */}
                 <div>
                   <label className="text-sm font-medium text-gray-500 mb-1 block">Số rơ mooc</label>
                   <div className="flex gap-2">
                     <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-xl font-mono font-bold text-gray-800 tracking-wider">
                       {scanResult.mooc || "---"}
                     </div>
                     <Button 
                        disabled={!scanResult.mooc}
                        onClick={() => scanResult.mooc && copyToClipboard(scanResult.mooc, 'mooc')}
                        variant={copiedField === 'mooc' ? 'primary' : 'secondary'}
                        className="w-14"
                     >
                        {copiedField === 'mooc' ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                     </Button>
                   </div>
                 </div>
               </div>

               <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Button onClick={resetScanner} className="w-full">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Quét xe tiếp theo
                  </Button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <XCircle className="w-12 h-12 mb-2 opacity-50" />
              <p>Có lỗi xảy ra</p>
              <Button onClick={resetScanner} variant="outline" className="mt-4">Thử lại</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};