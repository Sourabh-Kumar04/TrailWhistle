import React from 'react';
import { Check, Edit3, Bird, Sparkles, MapPin, Info, HelpCircle, ShieldCheck, Activity, Music } from 'lucide-react';
import { PredictionResult } from '../types/journal';

interface PredictionCardProps {
  predictions: PredictionResult[];
  onConfirm: (prediction: PredictionResult) => void;
  onOpenEditModal: (prediction: PredictionResult) => void;
  isSunlightMode: boolean;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  predictions,
  onConfirm,
  onOpenEditModal,
  isSunlightMode,
}) => {
  if (!predictions || predictions.length === 0) return null;

  const topPrediction = predictions[0];
  const isUnknown = topPrediction.speciesId === 'unknown' || topPrediction.confidence < 0.25;
  const runnersUp = isUnknown ? [] : predictions.slice(1, 3);

  return (
    <div className="space-y-3.5 mt-4 animate-fade-in">
      {/* Top Prediction Banner */}
      <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
        isSunlightMode
          ? 'bg-white border border-neutral-300 text-neutral-900 shadow-md'
          : isUnknown
            ? 'bg-[#180e05] border border-amber-600/50 text-amber-50 shadow-xl ring-1 ring-amber-500/20'
            : 'bg-[#06140b] border border-emerald-700/60 text-white shadow-xl ring-1 ring-emerald-500/20'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-[11px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
            isSunlightMode
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
              : isUnknown
                ? 'bg-amber-950/90 text-amber-300 border border-amber-600/50'
                : 'bg-emerald-950/90 text-feather-yellow border border-emerald-700/60'
          }`}>
            {isUnknown ? (
              <>
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Inconclusive Audio (&lt;25%)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-feather-yellow" />
                <span>Top Bioacoustic Match</span>
              </>
            )}
          </span>

          <span className={`font-mono text-xs sm:text-sm font-extrabold ${
            isSunlightMode
              ? 'text-neutral-900'
              : isUnknown ? 'text-amber-400' : 'text-feather-yellow'
          }`}>
            {Math.round(topPrediction.confidence * 100)}% Confidence
          </span>
        </div>

        {/* Confidence Gauge Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden mb-4 ${
          isSunlightMode ? 'bg-neutral-200' : 'bg-black/60 border border-emerald-950'
        }`}>
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isSunlightMode
                ? 'bg-emerald-700'
                : isUnknown
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-feather-yellow'
            }`}
            style={{ width: `${Math.max(8, Math.round(topPrediction.confidence * 100))}%` }}
          />
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{topPrediction.commonName}</h3>
            {topPrediction.iucnStatus && !isUnknown && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isSunlightMode
                  ? 'bg-neutral-100 border border-neutral-300 text-neutral-800'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80'
              }`}>
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{topPrediction.iucnStatus}</span>
              </span>
            )}
          </div>
          <p className={`text-xs italic ${isSunlightMode ? 'text-neutral-600 font-semibold' : 'text-emerald-300/80'}`}>
            {topPrediction.scientificName}
            {topPrediction.family && (
              <span className="not-italic font-sans opacity-90 ml-2 text-[11px] font-medium">
                • {topPrediction.family}
              </span>
            )}
          </p>
        </div>

        {/* Habitat & Acoustic Details */}
        <div className={`p-3.5 rounded-xl text-xs mb-4 space-y-2 border ${
          isSunlightMode
            ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
            : isUnknown
              ? 'bg-[#1a0e05]/60 border-amber-900/40 text-amber-100'
              : 'bg-[#040e07] border-emerald-900/80 text-emerald-100'
        }`}>
          {isUnknown ? (
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                <strong className="font-bold text-amber-300">Honest Detection:</strong> Signal confidence is below the 25% threshold. We never invent fake species. Try recording closer to the bird or during a louder call.
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong className={`font-bold ${isSunlightMode ? 'text-neutral-900' : 'text-white'}`}>Habitat:</strong> {topPrediction.habitat}</span>
              </div>
              {topPrediction.callType && (
                <div className="flex items-start gap-2">
                  <Music className="w-3.5 h-3.5 text-feather-yellow shrink-0 mt-0.5" />
                  <span><strong className={`font-bold ${isSunlightMode ? 'text-neutral-900' : 'text-white'}`}>Acoustic Vocalization:</strong> {topPrediction.callType}</span>
                </div>
              )}
              {topPrediction.frequencyBandHz && (
                <div className="flex items-start gap-2">
                  <Activity className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span><strong className={`font-bold ${isSunlightMode ? 'text-neutral-900' : 'text-white'}`}>Bioacoustic Frequency:</strong> {topPrediction.frequencyBandHz}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(topPrediction)}
            className={`py-3 min-h-[48px] px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer ${
              isSunlightMode
                ? 'bg-emerald-900 text-white hover:bg-emerald-800'
                : isUnknown
                  ? 'bg-amber-800 hover:bg-amber-700 text-white border border-amber-600/80 shadow-amber-950/50'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border border-emerald-400/40 shadow-emerald-950/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isUnknown ? 'Log as Unknown' : 'Quick Confirm'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenEditModal(topPrediction)}
            className={`py-3 min-h-[48px] px-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
              isSunlightMode
                ? 'bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200'
                : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-800/80'
            }`}
          >
            <Edit3 className="w-4 h-4 text-emerald-400" />
            <span>Add Notes / GPS</span>
          </button>
        </div>
      </div>

      {/* Runner-up Candidates (Only shown for valid real matches >= 25%, never padded) */}
      {runnersUp.length > 0 && (
        <div className={`p-4 rounded-2xl border transition-all ${
          isSunlightMode ? 'bg-white border-neutral-300 shadow-sm' : 'bg-[#06140b] border-emerald-900/70 shadow-lg'
        }`}>
          <div className={`text-[11px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${
            isSunlightMode ? 'text-neutral-700' : 'text-emerald-400/80'
          }`}>
            <Bird className="w-3.5 h-3.5 text-feather-yellow" />
            <span>Alternate Probable Taxa:</span>
          </div>

          <div className="space-y-2">
            {runnersUp.map((candidate, idx) => (
              <div
                key={candidate.speciesId || idx}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isSunlightMode
                    ? 'bg-neutral-50 border-neutral-200 text-neutral-900'
                    : 'bg-[#040e07] border-emerald-900/80 text-white'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="font-bold text-xs sm:text-sm">{candidate.commonName}</div>
                  <div className={`text-[10px] italic ${isSunlightMode ? 'text-neutral-600' : 'text-emerald-400/70'}`}>
                    {candidate.scientificName}
                  </div>
                  {/* Miniature confidence bar */}
                  <div className={`w-32 h-1.5 rounded-full mt-2 overflow-hidden ${
                    isSunlightMode ? 'bg-neutral-200' : 'bg-black/60 border border-emerald-950'
                  }`}>
                    <div
                      className={`h-full rounded-full ${
                        isSunlightMode ? 'bg-emerald-700' : 'bg-gradient-to-r from-emerald-500 to-feather-yellow'
                      }`}
                      style={{ width: `${Math.round(candidate.confidence * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`font-mono text-xs font-bold ${
                    isSunlightMode ? 'text-neutral-900' : 'text-feather-yellow'
                  }`}>
                    {Math.round(candidate.confidence * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(candidate)}
                    className={`py-1.5 px-3 min-h-[38px] rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                      isSunlightMode
                        ? 'bg-white border border-neutral-300 text-neutral-900 hover:bg-neutral-100 shadow-2xs'
                        : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-200 border border-emerald-800'
                    }`}
                    title="Select this candidate instead"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
