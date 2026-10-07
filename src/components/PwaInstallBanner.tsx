import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PwaInstallBannerProps {
  isSunlightMode: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ isSunlightMode }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div className={`p-3.5 rounded-xl border mb-4 flex items-center justify-between text-xs transition-all ${
      isSunlightMode 
        ? 'bg-yellow-50 border-black text-black' 
        : 'bg-forest-900 border-feather-accent/60 text-earth-100'
    }`}>
      <div className="flex items-center gap-2.5">
        <Smartphone className="w-4 h-4 text-feather-yellow shrink-0" />
        <span>Install TrailWhistle to home screen for 100% offline trail use.</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstallClick}
          className={`px-3 py-1.5 min-h-[36px] rounded-lg font-bold flex items-center gap-1 transition-all ${
            isSunlightMode
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-feather-accent text-white hover:bg-yellow-600'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="p-1 rounded text-gray-400 hover:text-white"
          aria-label="Dismiss install banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
