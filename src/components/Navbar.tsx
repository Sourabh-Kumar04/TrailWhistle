import React, { useState, useEffect } from 'react';
import { Compass, Feather, BookOpen, Sun, Moon, WifiOff, Trees, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavbarProps {
  activeTab: 'identify' | 'journal';
  onTabChange: (tab: 'identify' | 'journal') => void;
  isSunlightMode: boolean;
  onToggleSunlightMode: () => void;
  journalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isSunlightMode,
  onToggleSunlightMode,
  journalCount,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallDismissed, setIsInstallDismissed] = useState<boolean>(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsInstallDismissed(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      isSunlightMode 
        ? 'bg-white border-black text-black shadow-sm' 
        : 'bg-forest-950/95 border-forest-800/80 text-earth-50 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-xl flex items-center justify-center shadow-inner ${
            isSunlightMode 
              ? 'bg-black text-white' 
              : 'bg-gradient-to-br from-forest-700 to-forest-900 border border-forest-600/60 text-feather-yellow'
          }`}>
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-black text-lg sm:text-xl tracking-tight font-sans">TrailWhistle</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isSunlightMode 
                  ? 'bg-black text-white' 
                  : 'bg-forest-800/90 text-forest-200 border border-forest-700/60'
              }`}>
                <WifiOff className="w-2.5 h-2.5" />
                Offline
              </span>
              <span className={`hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isSunlightMode 
                  ? 'bg-gray-200 text-black border border-black' 
                  : 'bg-forest-900/90 text-feather-yellow border border-forest-700/70'
              }`}>
                BirdNET v2.4 • 6,522 Species
              </span>
            </div>
            <p className={`text-xs font-medium flex items-center gap-1.5 ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
              <Trees className="w-3 h-3 text-forest-400" />
              <span>Area Biodiversity Survey & Acoustic Census</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Tiny Dismissible PWA Install Chip */}
          {deferredPrompt && !isInstallDismissed && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSunlightMode
                  ? 'bg-black text-white border-black'
                  : 'bg-forest-800 text-feather-yellow border-forest-600 hover:bg-forest-700'
              }`}
            >
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 hover:underline"
                title="Install TrailWhistle for offline field use"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install App</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInstallDismissed(true)}
                className="p-0.5 ml-1 opacity-70 hover:opacity-100"
                aria-label="Dismiss install chip"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Sunlight Mode Toggle */}
          <button
            type="button"
            onClick={onToggleSunlightMode}
            title={isSunlightMode ? 'Switch to Night/Forest Mode' : 'Switch to High-Contrast Sunlight Mode'}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all ${
              isSunlightMode
                ? 'bg-black text-white border-2 border-black hover:bg-gray-800'
                : 'bg-forest-900 border border-forest-700 text-yellow-400 hover:bg-forest-800'
            }`}
            aria-label="Toggle outdoor sunlight contrast mode"
          >
            {isSunlightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation (2 Core Tabs: Identify & Journal) */}
      <div className={`border-t text-sm font-medium ${
        isSunlightMode ? 'border-black bg-gray-50' : 'border-forest-800/60 bg-forest-950/60'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2">
          <button
            type="button"
            onClick={() => onTabChange('identify')}
            className={`py-3 min-h-[48px] flex items-center justify-center gap-2 border-b-2 transition-all font-semibold ${
              activeTab === 'identify'
                ? isSunlightMode
                  ? 'border-black text-black bg-white shadow-sm font-bold'
                  : 'border-feather-yellow text-feather-yellow bg-forest-900/60 font-bold'
                : isSunlightMode
                  ? 'border-transparent text-gray-700 hover:text-black'
                  : 'border-transparent text-forest-300 hover:text-earth-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Identify</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('journal')}
            className={`py-3 min-h-[48px] flex items-center justify-center gap-2 border-b-2 transition-all font-semibold relative ${
              activeTab === 'journal'
                ? isSunlightMode
                  ? 'border-black text-black bg-white shadow-sm font-bold'
                  : 'border-feather-yellow text-feather-yellow bg-forest-900/60 font-bold'
                : isSunlightMode
                  ? 'border-transparent text-gray-700 hover:text-black'
                  : 'border-transparent text-forest-300 hover:text-earth-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Journal</span>
            {journalCount > 0 && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ml-1 ${
                isSunlightMode ? 'bg-black text-white' : 'bg-feather-accent text-white shadow-sm'
              }`}>
                {journalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
