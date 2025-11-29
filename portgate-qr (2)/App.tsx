import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { DriverView } from './views/DriverView';
import { StaffView } from './views/StaffView';
import { Truck, ScanLine, Download } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DRIVER);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    // Listen for the 'beforeinstallprompt' event
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-blue-900 tracking-tight">PORT<span className="text-blue-600">GATE</span></h1>
            <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">v1.1</div>
          </div>
          
          {/* Only show install button if the browser supports it and hasn't been installed yet */}
          {installPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md hover:bg-blue-700 transition-colors animate-pulse"
            >
              <Download className="w-3 h-3" />
              Cài App
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto no-scrollbar">
        {mode === AppMode.DRIVER ? <DriverView /> : <StaffView />}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 pb-safe pt-2 px-6 sticky bottom-0 z-20">
        <div className="flex gap-2 pb-2">
          <button
            onClick={() => setMode(AppMode.DRIVER)}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 ${
              mode === AppMode.DRIVER
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <Truck className={`w-6 h-6 mb-1 ${mode === AppMode.DRIVER ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-xs font-semibold">Tài xế</span>
          </button>
          
          <button
            onClick={() => setMode(AppMode.STAFF)}
            className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 ${
              mode === AppMode.STAFF
                ? 'bg-blue-50 text-blue-700 shadow-sm'
                : 'text-gray-400 hover:bg-gray-50'
            }`}
          >
            <ScanLine className={`w-6 h-6 mb-1 ${mode === AppMode.STAFF ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-xs font-semibold">Nhân viên Cảng</span>
          </button>
        </div>
      </nav>
      
      {/* Safe area padding for bottom of iphones */}
      <div className="h-4 bg-white"></div>
    </div>
  );
};

export default App;