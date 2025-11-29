import React, { useState, useEffect } from 'react';
import { AppMode } from './types';
import { DriverView } from './views/DriverView';
import { StaffView } from './views/StaffView';
import { Truck, ScanLine, Download, Share2, X } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.DRIVER);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect if app is running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                              (window.navigator as any).standalone || 
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      
      // If NOT installed, show the install modal automatically
      if (!isStandaloneMode) {
        setShowInstallModal(true);
      }
    };

    checkStandalone();

    // Detect iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // Listen for the 'beforeinstallprompt' event (Android)
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Auto show modal if prompt is available and not standalone
      if (!isStandalone) {
        setShowInstallModal(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
      setShowInstallModal(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: 'PortGate',
      text: 'Ứng dụng khai báo xe ra vào Cảng. Bấm vào link để sử dụng:',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Đã copy đường link! Bạn có thể dán vào Zalo để gửi.');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  // Main App Content
  const MainContent = (
    <div className="min-h-screen bg-gray-100 max-w-md mx-auto shadow-2xl overflow-hidden flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-blue-900 tracking-tight">PORT<span className="text-blue-600">GATE</span></h1>
            <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full">v1.2</div>
          </div>
          
          <button 
            onClick={handleShareClick}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            title="Chia sẻ ứng dụng"
          >
            <Share2 className="w-5 h-5" />
          </button>
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

  // Install Prompt Modal (Overlay)
  if (showInstallModal && !isStandalone) {
    return (
      <>
        {/* Render the app in background but blurred */}
        <div className="filter blur-sm pointer-events-none opacity-50 fixed inset-0 z-0">
           {MainContent}
        </div>

        {/* Modal Overlay */}
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl transform transition-all">
            
            {/* Close button for user to dismiss if they really want to */}
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
                <Truck className="w-8 h-8 text-white" />
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-2">Cài đặt PortGate</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Cài đặt ứng dụng vào điện thoại để sử dụng toàn màn hình, không cần mạng ổn định và truy cập nhanh hơn.
              </p>

              {isIOS ? (
                // iOS Instructions
                <div className="w-full bg-gray-50 rounded-xl p-4 text-left border border-gray-100">
                  <p className="font-semibold text-gray-800 mb-2 text-sm">Hướng dẫn cho iPhone:</p>
                  <ol className="text-sm text-gray-600 space-y-3">
                    <li className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border text-xs font-bold">1</span>
                      <span>Bấm nút <span className="inline-block px-1"><Share2 className="w-4 h-4 inline text-blue-500"/></span> (Chia sẻ) ở dưới cùng.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border text-xs font-bold">2</span>
                      <span>Chọn <span className="font-semibold">"Thêm vào MH chính"</span>.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-white rounded-full flex items-center justify-center border text-xs font-bold">3</span>
                      <span>Bấm <span className="font-semibold text-blue-600">Thêm</span> ở góc trên phải.</span>
                    </li>
                  </ol>
                </div>
              ) : (
                // Android / Desktop Action
                <button
                  onClick={handleInstallClick}
                  disabled={!installPrompt}
                  className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {installPrompt ? 'Cài đặt ngay' : 'Đang tải...'}
                </button>
              )}
              
              {!isIOS && !installPrompt && (
                 <p className="mt-4 text-xs text-gray-400">
                   Nếu nút không hoạt động, hãy bấm menu (3 chấm) trên trình duyệt và chọn "Cài đặt ứng dụng".
                 </p>
              )}
              
              <button 
                onClick={() => setShowInstallModal(false)}
                className="mt-4 text-sm text-gray-400 font-medium hover:text-gray-600"
              >
                Sử dụng tạm trên web
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return MainContent;
};

export default App;