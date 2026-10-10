import React, { useState } from 'react';
import { Bird, CheckCircle2, ChevronRight, Search, Sparkles, MapPin, Activity } from 'lucide-react';
import { SurveyChecklistItem } from '../types/journal';

interface AreaSpeciesChecklistProps {
  checklist: SurveyChecklistItem[];
  locationName: string;
  isSunlightMode: boolean;
}

export const AreaSpeciesChecklist: React.FC<AreaSpeciesChecklistProps> = ({
  checklist,
  locationName,
  isSunlightMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = checklist.filter((item) =>
    item.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col h-full transition-all ${
      isSunlightMode
        ? 'bg-white border-2 border-black text-black shadow-md'
        : 'bg-forest-900/60 border-forest-800 text-earth-50 shadow-lg'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-forest-800/40">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
              <Bird className="w-5 h-5 text-feather-yellow" />
              <span>Area Species Checklist</span>
            </h2>
            <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow border border-forest-700'
            }`}>
              {checklist.length} {checklist.length === 1 ? 'species' : 'species'}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
            Running acoustic census for <span className="font-semibold underline decoration-forest-500">{locationName}</span>
          </p>
        </div>

        {checklist.length > 3 && (
          <div className="relative w-36 sm:w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border ${
                isSunlightMode
                  ? 'bg-gray-50 border-gray-300 text-black'
                  : 'bg-forest-950 border-forest-700 text-white placeholder-forest-500'
              }`}
            />
          </div>
        )}
      </div>

      {/* Checklist Content */}
      {checklist.length === 0 ? (
        <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center rounded-xl border border-dashed ${
          isSunlightMode ? 'bg-gray-50 border-gray-400' : 'bg-forest-950/40 border-forest-800/80'
        }`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-inner ${
            isSunlightMode ? 'bg-gray-200 text-black' : 'bg-forest-800/80 text-feather-yellow'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm mb-1">Checklist Empty — Ready for Survey</h3>
          <p className={`text-xs max-w-sm mb-4 leading-relaxed ${
            isSunlightMode ? 'text-gray-700' : 'text-forest-300'
          }`}>
            Arrive at your site, point your phone toward the canopy or scrub, and record multiple 3-second audio clips to populate this live area checklist.
          </p>

          {/* 4-Step Field Workflow Infographic */}
          <div className="grid grid-cols-2 gap-2 text-left w-full max-w-sm">
            <div className={`p-2.5 rounded-lg border text-[11px] ${
              isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800 text-forest-200'
            }`}>
              <div className="font-bold text-feather-yellow mb-0.5 flex items-center gap-1">
                <span>1. Arrive</span>
              </div>
              <div className="opacity-80">Set current site name or GPS coordinates.</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-[11px] ${
              isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800 text-forest-200'
            }`}>
              <div className="font-bold text-feather-yellow mb-0.5 flex items-center gap-1">
                <span>2. Record</span>
              </div>
              <div className="opacity-80">Take 3-second rapid captures as you walk.</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-[11px] ${
              isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800 text-forest-200'
            }`}>
              <div className="font-bold text-feather-yellow mb-0.5 flex items-center gap-1">
                <span>3. Build</span>
              </div>
              <div className="opacity-80">BirdNET v2.4 aggregates distinct species.</div>
            </div>

            <div className={`p-2.5 rounded-lg border text-[11px] ${
              isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800 text-forest-200'
            }`}>
              <div className="font-bold text-feather-yellow mb-0.5 flex items-center gap-1">
                <span>4. Export</span>
              </div>
              <div className="opacity-80">Single-click export to CSV survey file.</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
          {filtered.map((item) => {
            const lastTime = new Date(item.lastDetectedTime).toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.speciesId}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  isSunlightMode
                    ? 'bg-gray-50 border-gray-300 text-black hover:border-black'
                    : 'bg-forest-950/70 border-forest-800/90 text-earth-50 hover:border-forest-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm tracking-tight">{item.commonName}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                        isSunlightMode
                          ? 'bg-black text-white'
                          : 'bg-forest-800 text-feather-yellow border border-forest-700'
                      }`}>
                        {item.detectionCount}x heard
                      </span>
                    </div>
                    <div className={`text-xs italic font-serif ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
                      {item.scientificName}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {Math.round(item.maxConfidence * 100)}% peak
                    </span>
                    <div className={`text-[10px] ${isSunlightMode ? 'text-gray-600' : 'text-forest-400'}`}>
                      last: {lastTime}
                    </div>
                  </div>
                </div>

                {/* Progress bar of peak confidence */}
                <div className={`w-full h-1.5 rounded-full overflow-hidden mb-2 ${
                  isSunlightMode ? 'bg-gray-200' : 'bg-forest-900'
                }`}>
                  <div
                    className={`h-full ${
                      isSunlightMode ? 'bg-black' : 'bg-gradient-to-r from-forest-500 to-feather-yellow'
                    }`}
                    style={{ width: `${Math.round(item.maxConfidence * 100)}%` }}
                  />
                </div>

                {/* Habitat tag */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-forest-800/30">
                  <span className={`flex items-center gap-1 ${isSunlightMode ? 'text-gray-700' : 'text-forest-400'}`}>
                    <MapPin className="w-3 h-3 text-forest-500 shrink-0" />
                    <span>{item.habitat}</span>
                  </span>
                  <span className={`text-[10px] ${isSunlightMode ? 'text-gray-600' : 'text-forest-400'}`}>
                    Confirmed in survey
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
