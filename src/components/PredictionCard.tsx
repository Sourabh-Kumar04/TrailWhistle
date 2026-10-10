import React from 'react';
import { Check, Edit3, Bird, Sparkles, MapPin, Info, HelpCircle } from 'lucide-react';
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
    <div className="space-y-3 mt-4 animate-fade-in">
      {/* Top Prediction Banner */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isSunlightMode
          ? 'bg-white border-2 border-black text-black shadow-lg'
          : isUnknown
            ? 'bg-forest-950/90 border-amber-500/60 text-earth-50 shadow-xl ring-1 ring-amber-500/30'
            : 'bg-forest-900/90 border-forest-600/80 text-earth-50 shadow-xl ring-1 ring-forest-500/30'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
            isSunlightMode
              ? 'bg-black text-white'
              : isUnknown
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                : 'bg-forest-800 text-feather-yellow border border-feather-accent/40'
          }`}>
            {isUnknown ? (
              <>
                <HelpCircle className="w-3 h-3 text-amber-400" />
                Inconclusive Audio (&lt;25%)
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Top Match
              </>
            )}
          </span>

          <span className="font-mono text-sm font-bold">
            {Math.round(topPrediction.confidence * 100)}% Confidence
          </span>
        </div>

        {/* Confidence Bar */}
        <div className={`w-full h-2 rounded-full overflow-hidden mb-3 ${
          isSunlightMode ? 'bg-gray-200' : 'bg-forest-950'
        }`}>
          <div
            className={`h-full transition-all duration-500 ${
              isSunlightMode
                ? 'bg-black'
                : isUnknown
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-forest-500 to-feather-yellow'
            }`}
            style={{ width: `${Math.max(8, Math.round(topPrediction.confidence * 100))}%` }}
          />
        </div>

        <div className="mb-3">
          <h3 className="text-2xl font-black tracking-tight">{topPrediction.commonName}</h3>
          <p className={`text-xs italic font-serif ${isSunlightMode ? 'text-gray-700' : 'text-forest-200'}`}>
            {topPrediction.scientificName}
          </p>
        </div>

        {/* Habitat & Acoustic Details */}
        <div className={`p-3 rounded-xl text-xs mb-4 space-y-1.5 ${
          isSunlightMode
            ? 'bg-gray-100 border border-gray-300'
            : isUnknown
              ? 'bg-amber-950/40 border border-amber-900/60 text-amber-100'
              : 'bg-forest-950/70 border border-forest-800'
        }`}>
          {isUnknown ? (
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Honest Detection:</strong> Signal confidence is below the 25% threshold. We never invent fake species. Try recording closer to the bird or during a louder call.
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-forest-400 shrink-0 mt-0.5" />
                <span><strong className="font-semibold">Habitat:</strong> {topPrediction.habitat}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-feather-yellow shrink-0 mt-0.5" />
                <span><strong className="font-semibold">Signature:</strong> {topPrediction.matchedClass}</span>
              </div>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onConfirm(topPrediction)}
            className={`py-3 min-h-[48px] px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 ${
              isSunlightMode
                ? 'bg-black text-white hover:bg-gray-800 border-2 border-black'
                : isUnknown
                  ? 'bg-amber-800 hover:bg-amber-700 text-white border border-amber-600'
                  : 'bg-forest-700 hover:bg-forest-600 text-white border border-forest-500'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isUnknown ? 'Log as Unknown' : 'Quick Confirm'}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenEditModal(topPrediction)}
            className={`py-3 min-h-[48px] px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all active:scale-98 ${
              isSunlightMode
                ? 'bg-gray-200 text-black border border-black hover:bg-gray-300'
                : 'bg-forest-800/80 hover:bg-forest-800 text-earth-100 border border-forest-700'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Add Notes / GPS</span>
          </button>
        </div>
      </div>

      {/* Runner-up Candidates (Only shown for valid real matches >= 25%, never padded) */}
      {runnersUp.length > 0 && (
        <div className={`p-4 rounded-xl border ${
          isSunlightMode ? 'bg-gray-50 border-black' : 'bg-forest-950/80 border-forest-800'
        }`}>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1 text-forest-300">
            <Bird className="w-3.5 h-3.5" />
            Alternate Probable Matches:
          </div>

          <div className="space-y-2">
            {runnersUp.map((candidate, idx) => (
              <div
                key={candidate.speciesId || idx}
                className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                  isSunlightMode
                    ? 'bg-white border-gray-300 text-black'
                    : 'bg-forest-900/60 border-forest-800 text-earth-100'
                }`}
              >
                <div className="flex-1 pr-2">
                  <div className="font-semibold text-xs">{candidate.commonName}</div>
                  <div className="text-[10px] opacity-75 italic">{candidate.scientificName}</div>
                  {/* Miniature confidence bar */}
                  <div className={`w-28 h-1 rounded-full mt-1.5 overflow-hidden ${isSunlightMode ? 'bg-gray-200' : 'bg-forest-950'}`}>
                    <div
                      className={`h-full ${isSunlightMode ? 'bg-black' : 'bg-feather-yellow'}`}
                      style={{ width: `${Math.round(candidate.confidence * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">
                    {Math.round(candidate.confidence * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEditModal(candidate)}
                    className={`p-2 min-w-[40px] min-h-[40px] rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      isSunlightMode
                        ? 'bg-gray-100 border border-black hover:bg-black hover:text-white'
                        : 'bg-forest-800 border border-forest-700 hover:bg-forest-700 text-forest-100'
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
