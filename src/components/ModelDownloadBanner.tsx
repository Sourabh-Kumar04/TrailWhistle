import React from 'react';
import { DownloadCloud, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { ModelProgressInfo } from '../types/model';

interface ModelDownloadBannerProps {
  progressInfo: ModelProgressInfo;
  onRetry: () => void;
  isSunlightMode: boolean;
}

export const ModelDownloadBanner: React.FC<ModelDownloadBannerProps> = ({
  progressInfo,
  onRetry,
  isSunlightMode,
}) => {
  if (progressInfo.status === 'idle') {
    return null;
  }

  if (progressInfo.status === 'ready') {
    return (
      <div className={`p-3 rounded-xl border mb-4 text-xs flex items-center justify-between ${
        isSunlightMode 
          ? 'bg-green-100 border-green-800 text-green-950 font-bold' 
          : 'bg-forest-900/80 border-forest-600/70 text-forest-100'
      }`}>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-forest-400 shrink-0" />
          <span>BirdNET v2.4 cached locally. 100% offline audio identification ready (6,522 species).</span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-forest-400">Offline Active</span>
      </div>
    );
  }

  if (progressInfo.status === 'loading') {
    const loadedMB = progressInfo.loadedBytes ? (progressInfo.loadedBytes / (1024 * 1024)).toFixed(1) : null;
    const totalMB = progressInfo.totalBytes ? (progressInfo.totalBytes / (1024 * 1024)).toFixed(1) : null;

    return (
      <div className={`p-4 rounded-xl border mb-4 shadow-sm ${
        isSunlightMode 
          ? 'bg-yellow-50 border-black text-black' 
          : 'bg-forest-900 border-feather-accent/50 text-earth-100'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-bold">
            <RefreshCw className="w-4 h-4 animate-spin text-feather-yellow" />
            <span>Downloading On-Device BirdNET v2.4 Model (~47MB)...</span>
          </div>
          <span className="text-xs font-mono font-bold">{progressInfo.progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className={`w-full h-2.5 rounded-full overflow-hidden ${
          isSunlightMode ? 'bg-gray-300' : 'bg-forest-950'
        }`}>
          <div
            className={`h-full transition-all duration-300 ${
              isSunlightMode ? 'bg-black' : 'bg-feather-yellow'
            }`}
            style={{ width: `${Math.max(5, progressInfo.progress)}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 text-[11px] opacity-80">
          <span>{progressInfo.file ? `Weights: ${progressInfo.file.split('/').pop()}` : 'Initializing ONNX runtime...'}</span>
          {loadedMB && totalMB ? <span>{loadedMB}MB / {totalMB}MB</span> : <span>One-time download</span>}
        </div>
      </div>
    );
  }

  if (progressInfo.status === 'error') {
    return (
      <div className={`p-4 rounded-xl border mb-4 ${
        isSunlightMode 
          ? 'bg-red-100 border-red-700 text-red-950' 
          : 'bg-red-950/80 border-red-700/80 text-red-200'
      }`}>
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-sm mb-1">Model Loading Error</h4>
            <p className="mb-2 leading-relaxed">{progressInfo.errorMessage || 'Unable to download model files. Check connection to prime cache.'}</p>
            <button
              type="button"
              onClick={onRetry}
              className={`px-3 py-1.5 min-h-[36px] font-bold text-xs rounded-lg inline-flex items-center gap-1.5 transition-all ${
                isSunlightMode
                  ? 'bg-red-900 text-white hover:bg-black'
                  : 'bg-red-800 text-white hover:bg-red-700'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
