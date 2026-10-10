import React, { useState, useEffect } from 'react';
import { Compass, Feather, BookOpen, Sun, Moon, WifiOff, Trees, Download, X } from 'lucide-react';
import { OfflineDiagnosticModal } from './OfflineDiagnosticModal';

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
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);

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
    <header className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-all duration-200 ${
      isSunlightMode 
        ? 'bg-white/95 border-emerald-950/20 text-neutral-900 shadow-sm' 
        : 'bg-[#08140d]/90 border-emerald-900/40 text-earth-50 shadow-xl'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md transition-all ${
            isSunlightMode 
              ? 'bg-emerald-900 text-white shadow-emerald-950/10' 
              : 'bg-gradient-to-br from-emerald-600 via-forest-600 to-forest-900 border border-emerald-400/40 text-feather-yellow shadow-emerald-900/30'
          }`}>
            <Feather className="w-5 h-5 transition-transform hover:rotate-12" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight font-sans truncate">TrailWhistle</span>
              <button
                type="button"
                onClick={() => setIsDiagnosticOpen(true)}
                title="Inspect on-device offline cache & field readiness"
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
                  isSunlightMode 
                    ? 'bg-emerald-900 text-white hover:bg-emerald-800' 
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 hover:text-white hover:border-emerald-400'
                }`}
              >
                <WifiOff className="w-2.5 h-2.5" />
                <span>Offline</span>
              </button>
              <span className={`hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                isSunlightMode 
                  ? 'bg-neutral-100 text-emerald-950 border border-neutral-300' 
                  : 'bg-forest-900/90 text-feather-yellow border border-forest-700/60'
              }`}>
                BirdNET v2.4 • 6,522 Species
              </span>
            </div>
            <p className={`text-[11px] font-medium flex items-center gap-1 truncate ${
              isSunlightMode ? 'text-neutral-700' : 'text-emerald-300/80'
            }`}>
              <Trees className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">Area Biodiversity Survey & Acoustic Census</span>
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Desktop/Tablet Segmented Switcher */}
          <nav className={`hidden sm:flex items-center p-1 rounded-xl border ${
            isSunlightMode
              ? 'bg-neutral-100 border-neutral-300'
              : 'bg-canopy-950/80 border-emerald-900/50'
          }`}>
            <button
              type="button"
              onClick={() => onTabChange('identify')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'identify'
                  ? isSunlightMode
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'bg-emerald-700/90 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/30'
                  : isSunlightMode
                    ? 'text-neutral-600 hover:text-black'
                    : 'text-emerald-300/70 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Identify</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('journal')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'journal'
                  ? isSunlightMode
                    ? 'bg-white text-emerald-950 shadow-sm'
                    : 'bg-emerald-700/90 text-white shadow-md shadow-emerald-950/40 border border-emerald-500/30'
                  : isSunlightMode
                    ? 'text-neutral-600 hover:text-black'
                    : 'text-emerald-300/70 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Journal</span>
              {journalCount > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                  activeTab === 'journal'
                    ? isSunlightMode ? 'bg-emerald-900 text-white' : 'bg-feather-yellow text-forest-950'
                    : isSunlightMode ? 'bg-neutral-300 text-black' : 'bg-forest-800 text-emerald-300'
                }`}>
                  {journalCount}
                </span>
              )}
            </button>
          </nav>

          {/* Tiny Dismissible PWA Install Chip */}
          {deferredPrompt && !isInstallDismissed && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSunlightMode
                  ? 'bg-emerald-900 text-white border-emerald-900'
                  : 'bg-forest-900 text-feather-yellow border-forest-700 hover:bg-forest-800'
              }`}
            >
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1 hover:underline cursor-pointer"
                title="Install TrailWhistle for offline field use"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install</span>
              </button>
              <button
                type="button"
                onClick={() => setIsInstallDismissed(true)}
                className="p-0.5 ml-1 opacity-70 hover:opacity-100 cursor-pointer"
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
            title={isSunlightMode ? 'Switch to Night/Forest Dark Theme' : 'Switch to High-Contrast Outdoor Sunlight Mode'}
            className={`p-2 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isSunlightMode
                ? 'bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200'
                : 'bg-forest-900/80 border border-emerald-900/60 text-feather-yellow hover:bg-forest-800 hover:text-white'
            }`}
            aria-label="Toggle outdoor sunlight contrast mode"
          >
            {isSunlightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Strip (Compact & Clean) */}
      <div className={`sm:hidden border-t ${
        isSunlightMode ? 'border-neutral-200 bg-neutral-100/95' : 'border-emerald-950 bg-[#061009]/95'
      }`}>
        <div className="grid grid-cols-2 p-1 gap-1">
          <button
            type="button"
            onClick={() => onTabChange('identify')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'identify'
                ? isSunlightMode
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-700 text-white shadow-sm'
                : isSunlightMode
                  ? 'text-neutral-600'
                  : 'text-emerald-300/70'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Identify</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('journal')}
            className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'journal'
                ? isSunlightMode
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-700 text-white shadow-sm'
                : isSunlightMode
                  ? 'text-neutral-600'
                  : 'text-emerald-300/70'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Journal</span>
            {journalCount > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                activeTab === 'journal'
                  ? 'bg-feather-yellow text-forest-950'
                  : 'bg-forest-800 text-emerald-300'
              }`}>
                {journalCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Offline Field Readiness & Diagnostic Modal */}
      <OfflineDiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        isSunlightMode={isSunlightMode}
      />
    </header>
  );
};
