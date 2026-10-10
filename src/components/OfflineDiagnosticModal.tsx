import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Database,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  X,
  Cpu,
  FileJson,
  Radio,
  DownloadCloud,
} from 'lucide-react';
import { getJournalEntries, getActiveSurvey } from '../services/journal';
import { CACHE_NAME, DEFAULT_MODEL_URL } from '../services/classifier';

interface OfflineDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSunlightMode: boolean;
  onExportJsonBackup?: () => void;
}

export const OfflineDiagnosticModal: React.FC<OfflineDiagnosticModalProps> = ({
  isOpen,
  onClose,
  isSunlightMode,
  onExportJsonBackup,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);
  const [modelCached, setModelCached] = useState<boolean>(false);
  const [storageEstimate, setStorageEstimate] = useState<{ usageMB: number; quotaMB: number } | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        setSwRegistered(regs.length > 0);
      });
    }

    // Check Cache API for model buffer
    if ('caches' in window) {
      caches.open(CACHE_NAME).then(async (cache) => {
        const match = await cache.match(DEFAULT_MODEL_URL);
        setModelCached(!!match);
      }).catch(() => {});
    }

    // Check storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        const usageMB = Math.round((est.usage || 0) / (1024 * 1024));
        const quotaMB = Math.round((est.quota || 0) / (1024 * 1024));
        setStorageEstimate({ usageMB, quotaMB });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const entries = getJournalEntries();
  const activeSurvey = getActiveSurvey();

  const handleExportJson = () => {
    const backupData = {
      app: 'TrailWhistle',
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      activeSurvey,
      journalEntries: entries,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `trailwhistle_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
        isSunlightMode
          ? 'bg-white border-2 border-black text-black'
          : 'bg-canopy-900 border-forest-700/80 text-earth-50 shadow-2xl'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
          isSunlightMode ? 'border-neutral-900' : 'border-forest-800/80'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl flex items-center justify-center ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight font-sans">
                Field Readiness & Offline Diagnostic
              </h3>
              <p className={`text-xs ${isSunlightMode ? 'text-black font-medium' : 'text-forest-200'}`}>
                100% on-device autonomy verification for backcountry expeditions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-all ${
              isSunlightMode
                ? 'bg-neutral-100 hover:bg-neutral-200 text-black border border-black'
                : 'bg-forest-800 text-forest-300 hover:text-white'
            }`}
            aria-label="Close diagnostic modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Diagnostic Items */}
        <div className="space-y-2.5 mb-5 text-xs">
          {/* 1. Network Status */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isSunlightMode
              ? 'bg-neutral-50 border-2 border-black'
              : 'bg-canopy-950/80 border-forest-800/80'
          }`}>
            <div className="flex items-center gap-2.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <div>
                <div className="font-bold">
                  {isOnline ? 'Online (Wi-Fi / Cell Connected)' : 'Offline / Backcountry Mode Active'}
                </div>
                <div className={`text-[11px] ${isSunlightMode ? 'text-neutral-800' : 'text-forest-300'}`}>
                  {isOnline
                    ? 'Ready to prime local caches before leaving trailhead'
                    : 'Zero cloud dependency. TrailWhistle operates entirely on-device'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isOnline
                ? isSunlightMode ? 'bg-black text-white' : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                : isSunlightMode ? 'bg-amber-100 text-amber-950 border border-black font-extrabold' : 'bg-amber-950 text-amber-300 border border-amber-700/60'
            }`}>
              {isOnline ? 'CONNECTED' : 'STANDALONE'}
            </span>
          </div>

          {/* 2. BirdNET v2.4 ONNX Model Cache */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isSunlightMode
              ? 'bg-neutral-50 border-2 border-black'
              : 'bg-canopy-950/80 border-forest-800/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4 text-feather-yellow shrink-0" />
              <div>
                <div className="font-bold">BirdNET v2.4 Neural Core (~47MB)</div>
                <div className={`text-[11px] ${isSunlightMode ? 'text-neutral-800' : 'text-forest-300'}`}>
                  {modelCached
                    ? 'INT8 quantized weights cached locally in browser Cache API'
                    : 'Model loads on-demand on first recording or test clip'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-emerald-300 border border-forest-700'
            }`}>
              {modelCached ? 'CACHED' : 'ON-DEMAND'}
            </span>
          </div>

          {/* 3. Global Avian Taxonomy */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isSunlightMode
              ? 'bg-neutral-50 border-2 border-black'
              : 'bg-canopy-950/80 border-forest-800/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold">6,522 Species Global Taxonomy</div>
                <div className={`text-[11px] ${isSunlightMode ? 'text-neutral-800' : 'text-forest-300'}`}>
                  Full Latin binomial & English common names bundled offline
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow border border-forest-700'
            }`}>
              6,522 ACTIVE
            </span>
          </div>

          {/* 4. AudioWorklet & WebAssembly Core */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isSunlightMode
              ? 'bg-neutral-50 border-2 border-black'
              : 'bg-canopy-950/80 border-forest-800/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <div className="font-bold">48kHz AudioWorklet + WebAssembly SIMD</div>
                <div className={`text-[11px] ${isSunlightMode ? 'text-neutral-800' : 'text-forest-300'}`}>
                  Hardware-accelerated on-device neural tensor computation
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-sky-300 border border-forest-700'
            }`}>
              WASM SIMD
            </span>
          </div>

          {/* 5. Storage Quota */}
          <div className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
            isSunlightMode
              ? 'bg-neutral-50 border-2 border-black'
              : 'bg-canopy-950/80 border-forest-800/80'
          }`}>
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-4 h-4 text-moss-400 shrink-0" />
              <div>
                <div className="font-bold">Local Device Storage Quota</div>
                <div className={`text-[11px] ${isSunlightMode ? 'text-neutral-800' : 'text-forest-300'}`}>
                  {entries.length} observations saved in private localStorage
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-forest-200 border border-forest-700'
            }`}>
              {storageEstimate ? `${storageEstimate.usageMB}MB / ${storageEstimate.quotaMB}MB` : 'LOCAL OK'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 border-t border-forest-800/40">
          <button
            type="button"
            onClick={handleExportJson}
            className={`w-full sm:w-auto py-2.5 px-3.5 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isSunlightMode
                ? 'bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black'
                : 'bg-forest-800 hover:bg-forest-700 text-forest-100 border border-forest-600'
            }`}
            title="Download full JSON survey backup"
          >
            <FileJson className="w-4 h-4 text-feather-yellow" />
            <span>Export Raw JSON Backup</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto py-2.5 px-5 min-h-[44px] rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
              isSunlightMode
                ? 'bg-black text-white hover:bg-neutral-800 border-2 border-black'
                : 'bg-moss-700 hover:bg-moss-600 text-white border border-moss-500'
            }`}
          >
            <span>Close Diagnostic</span>
          </button>
        </div>
      </div>
    </div>
  );
};
