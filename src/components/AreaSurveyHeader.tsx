import React, { useState } from 'react';
import { MapPin, Trees, Clock, Plus, Download, Edit2, Check, Sparkles, Database } from 'lucide-react';
import { SurveySession } from '../types/journal';
import { DEFAULT_SURVEY_LOCATIONS, HABITAT_TAGS } from '../services/journal';

interface AreaSurveyHeaderProps {
  survey: SurveySession;
  onUpdateSurvey: (survey: SurveySession) => void;
  onNewSurvey: () => void;
  onExportCsv: () => void;
  speciesCount: number;
  totalRecordings: number;
  isSunlightMode: boolean;
}

export const AreaSurveyHeader: React.FC<AreaSurveyHeaderProps> = ({
  survey,
  onUpdateSurvey,
  onNewSurvey,
  onExportCsv,
  speciesCount,
  totalRecordings,
  isSunlightMode,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(survey.locationName);

  // Compute elapsed time
  const startTime = new Date(survey.startTime).getTime();
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdateSurvey({ ...survey, locationName: tempName.trim() });
    }
    setIsEditingName(false);
  };

  const handleSelectPreset = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      setTempName(val);
      onUpdateSurvey({ ...survey, locationName: val });
    }
  };

  const handleSelectHabitat = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSurvey({ ...survey, habitatTag: e.target.value });
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all mb-4 ${
      isSunlightMode
        ? 'bg-white border-neutral-300 text-neutral-900 shadow-sm'
        : 'bg-gradient-to-br from-[#0d1e13] via-[#09170e] to-[#050e08] border-emerald-800/50 text-white shadow-xl'
    }`}>
      {/* Headline Feature: BirdNET v2.4 6,522 Species Headline */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b ${
        isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/40'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm ${
            isSunlightMode
              ? 'bg-emerald-900 text-white'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-feather-yellow" />
            <span>Area biodiversity survey</span>
          </span>
          <span className={`text-xs font-medium hidden md:inline-flex items-center gap-1.5 ${
            isSunlightMode ? 'text-neutral-800' : 'text-emerald-200/90'
          }`}>
            <Database className="w-3.5 h-3.5 text-feather-yellow" />
            <strong className="font-semibold">BirdNET v2.4 Neural Core</strong> • 6,522 Species Global Taxonomy
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Survey Pulse indicator */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            isSunlightMode
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <Clock className="w-3 h-3" />
            <span>{elapsedMinutes}m active</span>
          </span>

          {/* New Survey Button */}
          <button
            type="button"
            onClick={onNewSurvey}
            className={`px-3 py-1.5 min-h-[36px] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isSunlightMode
                ? 'bg-neutral-100 text-neutral-900 border border-neutral-300 hover:bg-neutral-200'
                : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white border border-emerald-700/60 shadow-sm'
            }`}
            title="Start a new area survey session at another site"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Site</span>
          </button>
        </div>
      </div>

      {/* Survey Site & Transect Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Location & Habitat */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg shrink-0 ${
              isSunlightMode ? 'bg-amber-100 text-amber-900' : 'bg-amber-500/10 text-feather-yellow border border-amber-500/20'
            }`}>
              <MapPin className="w-4 h-4" />
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1 max-w-md">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className={`px-3 py-1.5 text-sm font-bold rounded-lg border flex-1 outline-none ${
                    isSunlightMode ? 'bg-white border-neutral-400 text-neutral-900 focus:border-black' : 'bg-canopy-950 border-emerald-700 text-white focus:border-emerald-400'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg cursor-pointer"
                  title="Save site name"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-sans">{survey.locationName}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(survey.locationName);
                    setIsEditingName(true);
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isSunlightMode ? 'text-neutral-500 hover:text-black hover:bg-neutral-100' : 'text-emerald-400/70 hover:text-white hover:bg-emerald-900/40'
                  }`}
                  title="Rename survey site"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Preset Selector & Habitat Tag */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Location Quick Switcher */}
            <div className="relative">
              <select
                value={DEFAULT_SURVEY_LOCATIONS.includes(survey.locationName) ? survey.locationName : ''}
                onChange={handleSelectPreset}
                className={`text-xs font-semibold py-1.5 px-3 rounded-lg border appearance-none pr-8 cursor-pointer transition-all ${
                  isSunlightMode
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200'
                    : 'bg-[#06120a] border-emerald-800/80 text-emerald-200 hover:border-emerald-600'
                }`}
              >
                <option value="" disabled>Trail Presets...</option>
                {DEFAULT_SURVEY_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60">▼</span>
            </div>

            {/* Habitat Selector */}
            <div className="relative flex items-center">
              <select
                value={survey.habitatTag || 'Mixed Woodland'}
                onChange={handleSelectHabitat}
                className={`text-xs font-semibold py-1.5 pl-7 pr-8 rounded-lg border appearance-none cursor-pointer transition-all ${
                  isSunlightMode
                    ? 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200'
                    : 'bg-[#06120a] border-emerald-800/80 text-emerald-200 hover:border-emerald-600'
                }`}
              >
                {HABITAT_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <Trees className={`pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
                isSunlightMode ? 'text-emerald-700' : 'text-emerald-400'
              }`} />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] opacity-60">▼</span>
            </div>
          </div>
        </div>

        {/* Survey Action: Export CSV */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={totalRecordings === 0}
            className={`py-2.5 px-4 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              totalRecordings === 0
                ? isSunlightMode 
                  ? 'opacity-40 cursor-not-allowed bg-neutral-200 text-neutral-500 border border-neutral-300' 
                  : 'opacity-40 cursor-not-allowed bg-emerald-950/40 text-emerald-500/50 border border-emerald-900/40'
                : isSunlightMode
                  ? 'bg-emerald-900 text-white hover:bg-emerald-800 shadow-emerald-950/10 hover:scale-[1.02] active:scale-95'
                  : 'bg-gradient-to-r from-emerald-600 to-forest-600 hover:from-emerald-500 hover:to-forest-500 text-white border border-emerald-400/40 shadow-emerald-950/40 hover:scale-[1.02] active:scale-95'
            }`}
            title="Download CSV report of current area biodiversity survey"
          >
            <Download className="w-4 h-4" />
            <span>Export Area Survey CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};
