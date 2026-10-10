import React, { useState } from 'react';
import { Bird, CheckCircle2, ChevronRight, Search, Sparkles, MapPin, Activity } from 'lucide-react';
import { SurveyChecklistItem } from '../types/journal';

interface AreaSpeciesChecklistProps {
  checklist: SurveyChecklistItem[];
  locationName: string;
  isSunlightMode: boolean;
  onRunSampleDemo?: () => void;
}

export const AreaSpeciesChecklist: React.FC<AreaSpeciesChecklistProps> = ({
  checklist,
  locationName,
  isSunlightMode,
  onRunSampleDemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = checklist.filter((item) =>
    item.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border flex flex-col h-full transition-all duration-300 ${
      isSunlightMode
        ? 'bg-white border-neutral-300 text-neutral-900 shadow-md'
        : 'bg-gradient-to-br from-[#0c1b12]/95 via-[#08150e]/95 to-[#040c07]/95 border-emerald-800/50 text-earth-50 shadow-2xl'
    }`}>
      {/* Header */}
      <div className={`flex items-center justify-between gap-2 pb-3.5 mb-4 border-b ${
        isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/40'
      }`}>
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              isSunlightMode ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/10 text-feather-yellow border border-amber-500/20'
            }`}>
              <Bird className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-black tracking-tight uppercase font-sans">
              Area Species Checklist
            </h2>
            <span className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
              checklist.length > 0
                ? isSunlightMode ? 'bg-emerald-900 text-white' : 'bg-emerald-600 text-white shadow-sm'
                : isSunlightMode ? 'bg-neutral-100 text-neutral-600' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
            }`}>
              {checklist.length} {checklist.length === 1 ? 'species' : 'species'}
            </span>
          </div>
          <p className={`text-[11px] mt-1 ${isSunlightMode ? 'text-neutral-600' : 'text-emerald-300/70'}`}>
            Live tally for <strong className={isSunlightMode ? 'text-neutral-900' : 'text-feather-yellow'}>{locationName}</strong>
          </p>
        </div>

        {checklist.length > 3 && (
          <div className="relative w-36 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter species..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border outline-none ${
                isSunlightMode
                  ? 'bg-neutral-50 border-neutral-300 text-neutral-900 focus:border-black'
                  : 'bg-[#06120a] border-emerald-800 text-white placeholder-emerald-600 focus:border-emerald-400'
              }`}
            />
          </div>
        )}
      </div>

      {/* Checklist Content */}
      {checklist.length === 0 ? (
        <div className={`flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center rounded-xl border transition-all ${
          isSunlightMode 
            ? 'bg-neutral-50/80 border-neutral-300 text-neutral-900' 
            : 'bg-gradient-to-b from-[#07130b]/80 to-[#040a06]/90 border-emerald-900/40 text-emerald-100'
        }`}>
          {/* Animated Sonar Radar Visualizer */}
          <div className="relative mb-4 flex items-center justify-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform ${
              isSunlightMode 
                ? 'bg-emerald-900 text-white shadow-emerald-950/20' 
                : 'bg-gradient-to-br from-emerald-600 to-forest-800 text-feather-yellow border border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]'
            }`}>
              <Bird className="w-8 h-8" />
            </div>
            <div className="absolute -inset-2 rounded-full border border-emerald-500/30 animate-ping opacity-30 pointer-events-none" />
            <div className="absolute -inset-4 rounded-full border border-emerald-500/10 pointer-events-none" />
          </div>

          <h3 className="font-extrabold text-base mb-1 tracking-tight font-sans">
            Census Station Active
          </h3>
          <p className={`text-xs max-w-sm mb-5 leading-relaxed ${
            isSunlightMode ? 'text-neutral-600 font-medium' : 'text-emerald-300/70'
          }`}>
            Waiting for audio captures in <strong className={isSunlightMode ? 'text-black' : 'text-feather-yellow'}>{locationName}</strong>. Tap Record or test with a field sample to populate this live area checklist.
          </p>

          {/* Expected Taxa in Habitat Preview */}
          <div className={`w-full max-w-md p-3 rounded-xl border mb-5 text-left ${
            isSunlightMode ? 'bg-white border-neutral-300' : 'bg-[#06120a] border-emerald-900/60'
          }`}>
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider mb-2 opacity-75">
              <span>Expected Bioacoustic Signatures:</span>
              <span>4 Common Taxa</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Turdidae (Thrushes)', status: 'LC' },
                { name: 'Passerellidae (Sparrows)', status: 'LC' },
                { name: 'Columbidae (Doves)', status: 'LC' },
                { name: 'Tytonidae (Owls)', status: 'LC' },
              ].map((taxa, i) => (
                <span
                  key={i}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                    isSunlightMode 
                      ? 'bg-neutral-100 text-neutral-800 border border-neutral-200' 
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{taxa.name}</span>
                </span>
              ))}
            </div>
          </div>

          {onRunSampleDemo && (
            <button
              type="button"
              onClick={onRunSampleDemo}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer hover:scale-105 ${
                isSunlightMode
                  ? 'bg-emerald-900 hover:bg-emerald-800 text-white shadow-emerald-950/10 font-bold'
                  : 'bg-gradient-to-r from-emerald-600 via-forest-600 to-forest-700 hover:from-emerald-500 hover:to-forest-600 text-white border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-feather-yellow" />
              <span>Simulate American Robin Call</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
          {filtered.map((item) => {
            const lastTime = new Date(item.lastDetectedTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.speciesId}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] ${
                  isSunlightMode
                    ? 'bg-white border-neutral-300 text-neutral-900 shadow-sm hover:border-black'
                    : 'bg-gradient-to-br from-[#0c1a11]/90 to-[#07130b]/90 border-emerald-900/60 hover:border-emerald-600 text-white shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base tracking-tight truncate font-sans">
                        {item.commonName}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSunlightMode
                          ? 'bg-emerald-100 text-emerald-950 font-bold'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                      }`}>
                        {item.detectionCount}x heard
                      </span>
                      {item.iucnStatus && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${
                          isSunlightMode 
                            ? 'bg-neutral-100 text-emerald-900 border border-neutral-300' 
                            : 'bg-emerald-900/80 text-emerald-200 border border-emerald-600/50'
                        }`}>
                          {item.iucnStatus}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs italic font-serif mt-0.5 ${
                      isSunlightMode ? 'text-neutral-700' : 'text-emerald-300/80'
                    }`}>
                      {item.scientificName}
                      {item.family && (
                        <span className="not-italic font-sans opacity-70 ml-1.5 text-[10px]">
                          • {item.family}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`font-mono text-sm font-black ${
                      isSunlightMode ? 'text-emerald-800' : 'text-feather-yellow'
                    }`}>
                      {Math.round(item.maxConfidence * 100)}% peak
                    </span>
                    <div className={`text-[10px] font-medium ${
                      isSunlightMode ? 'text-neutral-500' : 'text-emerald-400/60'
                    }`}>
                      last {lastTime}
                    </div>
                  </div>
                </div>

                {/* Progress bar of peak confidence */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden mb-2.5 ${
                  isSunlightMode ? 'bg-neutral-200' : 'bg-[#050e08]'
                }`}>
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSunlightMode 
                        ? 'bg-emerald-900' 
                        : 'bg-gradient-to-r from-emerald-500 to-feather-yellow shadow-sm'
                    }`}
                    style={{ width: `${Math.round(item.maxConfidence * 100)}%` }}
                  />
                </div>

                {/* Habitat tag & bio details */}
                <div className={`flex items-center justify-between text-[11px] pt-2 border-t ${
                  isSunlightMode ? 'border-neutral-200' : 'border-emerald-950/80'
                }`}>
                  <span className={`flex items-center gap-1 font-medium ${
                    isSunlightMode ? 'text-neutral-700' : 'text-emerald-300/70'
                  }`}>
                    <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{item.habitat}</span>
                  </span>
                  <span className={`text-[10px] font-medium flex items-center gap-1 ${
                    isSunlightMode ? 'text-emerald-800 font-semibold' : 'text-emerald-400'
                  }`}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Logged to Transect</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
