

import React, { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { ScanResult } from '../types';
import { Button } from '../components/ui/Button';
import { Copy, CheckCircle, RefreshCw, XCircle, History as HistoryIcon, Clock as ClockIcon } from 'lucide-react';

const HISTORY_KEY = 'portgate_scan_history';

export const StaffView: React.FC = () => {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  const handleScan = (result: string) => {
    if (result) {
      try {
        const parts = result.split('|');
        let truck = null;
        let mooc = null;

        parts.forEach(part => {
          if (part.startsWith('T:')) truck = part.substring(2);
          if (part.startsWith('M:')) mooc = part.substring(2);
        });

        if (truck || mooc) {
          const newResult = { truck, mooc, raw: result };
          setScanResult(newResult);
          setIsScanning(false);
          
          // Add to history
          const historyItem = {
            ...newResult,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            id: Date.now()
          };
          const newHistory = [historyItem, ...history].slice(0, 10);
          setHistory(newHistory);
          localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));

          // Beep effect
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
    <div className="h-full flex flex-col space-y-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <ScanLine className="w-5 h-5 mr-2 text-blue-600" />
          Quét xe vào cổng
        </h2>
      </div>

      {isScanning ? (
        <div className="flex-1 min-h-[300px] bg-black rounded-2xl overflow-hidden relative shadow-lg">
           <Scanner 
              onScan={(results) => {
                if (results && results.length > 0) {
                  handleScan(results[0].rawValue);
                }
              }}
              components={{
                /* Removed 'audio' property which does not exist in IScannerComponents */
                torch: true,
                count: false,
                onOff: false,
              }}
              styles={{
                container: { height: '100%' }
              }}
          />
          <div className="absolute inset-0 border-2 border-blue-500/30 pointer-events-none flex items-center justify-center">
             <div className="w-64 h-64 border-2 border-white/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="flex-1 animate-in slide-in-from-bottom-4 duration-300">
          {scanResult ? (
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
               <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold text-lg flex items-center">
                   <CheckCircle className="w-6 h-6 mr-2" /> Đã nhận diện
                 </h3>
                 <span className="text-xs bg-blue-500 px-2 py-1 rounded text-blue-100">Cổng số 1</span>
               </div>
               
               <div className="p-6 space-y-6">
                 <div>
                   <label className="text-sm font-medium text-gray-500 mb-1 block uppercase tracking-wider">Số xe đầu kéo</label>
                   <div className="flex gap-2">
                     <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-2xl font-mono font-bold text-blue-900 tracking-widest">
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

                 <div>
                   <label className="text-sm font-medium text-gray-500 mb-1 block uppercase tracking-wider">Số rơ mooc</label>
                   <div className="flex gap-2">
                     <div className="flex-1 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 text-2xl font-mono font-bold text-blue-900 tracking-widest">
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
                  <Button onClick={resetScanner} className="w-full h-14 text-lg">
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Quét xe tiếp theo
                  </Button>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-10">
              <XCircle className="w-12 h-12 mb-2 opacity-50" />
              <p>Lỗi dữ liệu</p>
              <Button onClick={resetScanner} variant="outline" className="mt-4">Thử lại</Button>
            </div>
          )}
        </div>
      )}

      {/* History Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-sm font-bold text-gray-700 flex items-center">
            <HistoryIcon className="w-4 h-4 mr-1.5 text-gray-400" />
            Lịch sử quét gần đây
          </h3>
          <span className="text-[10px] text-gray-400 uppercase font-bold">10 xe gần nhất</span>
        </div>
        <div className="max-h-[200px] overflow-y-auto no-scrollbar">
          {history.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {history.map((item) => (
                <div key={item.id} className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">
                      {item.truck?.substring(0, 3) || '??'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{item.truck || 'N/A'}</div>
                      <div className="text-[10px] text-gray-500 font-medium">Mooc: {item.mooc || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-bold text-gray-400 flex items-center justify-end">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {item.timestamp}
                    </div>
                    <button 
                      onClick={() => copyToClipboard(`${item.truck}\n${item.mooc}`, 'hist')}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      Copy cả bộ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs italic">
              Chưa có dữ liệu quét trong phiên này
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock ScanLine icon for StaffView if missing
const ScanLine = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></svg>
);
