import React from 'react';
import { Compass, Feather, BookOpen, Sun, Moon, WifiOff } from 'lucide-react';

interface NavbarProps {
  activeTab: 'identify' | 'journal' | 'guide';
  onTabChange: (tab: 'identify' | 'journal' | 'guide') => void;
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
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
      isSunlightMode 
        ? 'bg-white border-black text-black' 
        : 'bg-forest-950/90 border-forest-800/80 text-earth-50'
    }`}>
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-2.5">
          <div className={`p-2 rounded-xl flex items-center justify-center ${
            isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow'
          }`}>
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight font-sans">TrailWhistle</span>
              <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded flex items-center gap-1 ${
                isSunlightMode 
                  ? 'bg-black text-white' 
                  : 'bg-forest-800/90 text-forest-200 border border-forest-700/50'
              }`}>
                <WifiOff className="w-2.5 h-2.5" />
                Offline
              </span>
            </div>
            <p className={`text-xs ${isSunlightMode ? 'text-gray-700 font-medium' : 'text-forest-300'}`}>
              On-Device Avian Classifier
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Sunlight Mode Toggle */}
          <button
            type="button"
            onClick={onToggleSunlightMode}
            title={isSunlightMode ? 'Switch to Night/Forest Mode' : 'Switch to High-Contrast Sunlight Mode'}
            className={`p-2.5 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-all ${
              isSunlightMode
                ? 'bg-black text-white border-2 border-black'
                : 'bg-forest-900 border border-forest-700 text-yellow-400 hover:bg-forest-800'
            }`}
            aria-label="Toggle outdoor sunlight contrast mode"
          >
            {isSunlightMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation (Large touch-friendly tabs) */}
      <div className={`grid grid-cols-3 border-t text-sm font-medium ${
        isSunlightMode ? 'border-black bg-gray-50' : 'border-forest-800/60 bg-forest-950/60'
      }`}>
        <button
          type="button"
          onClick={() => onTabChange('identify')}
          className={`py-3 min-h-[48px] flex items-center justify-center gap-1.5 border-b-2 transition-all font-semibold ${
            activeTab === 'identify'
              ? isSunlightMode
                ? 'border-black text-black bg-white shadow-sm'
                : 'border-feather-yellow text-feather-yellow bg-forest-900/50'
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
          className={`py-3 min-h-[48px] flex items-center justify-center gap-1.5 border-b-2 transition-all font-semibold relative ${
            activeTab === 'journal'
              ? isSunlightMode
                ? 'border-black text-black bg-white shadow-sm'
                : 'border-feather-yellow text-feather-yellow bg-forest-900/50'
              : isSunlightMode
                ? 'border-transparent text-gray-700 hover:text-black'
                : 'border-transparent text-forest-300 hover:text-earth-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Journal</span>
          {journalCount > 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded-full ml-1 ${
              isSunlightMode ? 'bg-black text-white' : 'bg-feather-accent text-white'
            }`}>
              {journalCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('guide')}
          className={`py-3 min-h-[48px] flex items-center justify-center gap-1.5 border-b-2 transition-all font-semibold ${
            activeTab === 'guide'
              ? isSunlightMode
                ? 'border-black text-black bg-white shadow-sm'
                : 'border-feather-yellow text-feather-yellow bg-forest-900/50'
              : isSunlightMode
                ? 'border-transparent text-gray-700 hover:text-black'
                : 'border-transparent text-forest-300 hover:text-earth-100'
          }`}
        >
          <Feather className="w-4 h-4" />
          <span>Touch Grass</span>
        </button>
      </div>
    </header>
  );
};
