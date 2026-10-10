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
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all mb-5 ${
      isSunlightMode
        ? 'bg-white border-2 border-black text-black shadow-md'
        : 'bg-gradient-to-br from-forest-900/90 via-forest-950/95 to-forest-950 border-forest-700/80 text-earth-50 shadow-xl'
    }`}>
      {/* Headline Feature: BirdNET v2.4 6,522 Species Headline */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b ${
        isSunlightMode ? 'border-gray-300' : 'border-forest-800/80'
      }`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm ${
            isSunlightMode
              ? 'bg-black text-white'
              : 'bg-feather-accent text-white font-bold'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            Area Biodiversity Survey Mode
          </span>
          <span className={`text-xs font-semibold hidden md:inline-flex items-center gap-1.5 ${
            isSunlightMode ? 'text-gray-800' : 'text-forest-200'
          }`}>
            <Database className="w-3.5 h-3.5 text-feather-yellow" />
            <strong>BirdNET v2.4 Neural Core</strong> • 6,522 Species Global Taxonomy
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Survey Pulse indicator */}
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
            isSunlightMode
              ? 'bg-gray-100 text-black border border-black'
              : 'bg-forest-800/80 text-forest-200 border border-forest-600/60'
          }`}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Clock className="w-3 h-3" />
            <span>{elapsedMinutes}m active</span>
          </span>

          {/* New Survey Button */}
          <button
            type="button"
            onClick={onNewSurvey}
            className={`px-2.5 py-1 min-h-[36px] text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${
              isSunlightMode
                ? 'bg-gray-200 text-black border border-black hover:bg-gray-300'
                : 'bg-forest-800 hover:bg-forest-700 text-forest-100 border border-forest-600'
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
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-feather-yellow shrink-0" />
            {isEditingName ? (
              <div className="flex items-center gap-1.5 flex-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className={`px-2.5 py-1 text-sm font-bold rounded-lg border flex-1 ${
                    isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-950 border-forest-600 text-white'
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1.5 bg-feather-accent text-white rounded-lg"
                  title="Save site name"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight">{survey.locationName}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setTempName(survey.locationName);
                    setIsEditingName(true);
                  }}
                  className="p-1 opacity-70 hover:opacity-100 text-forest-300 hover:text-white"
                  title="Rename survey site"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Preset Selector & Habitat Tag */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Location Quick Switcher */}
            <select
              value={DEFAULT_SURVEY_LOCATIONS.includes(survey.locationName) ? survey.locationName : ''}
              onChange={handleSelectPreset}
              className={`text-[11px] font-medium py-1 px-2 rounded-lg border cursor-pointer ${
                isSunlightMode
                  ? 'bg-gray-100 border-black text-black'
                  : 'bg-forest-950/80 border-forest-800 text-forest-200'
              }`}
            >
              <option value="" disabled>Trail Presets...</option>
              {DEFAULT_SURVEY_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>

            {/* Habitat Selector */}
            <div className="flex items-center gap-1">
              <Trees className="w-3 h-3 opacity-70" />
              <select
                value={survey.habitatTag || 'Mixed Woodland'}
                onChange={handleSelectHabitat}
                className={`text-[11px] font-medium py-1 px-2 rounded-lg border cursor-pointer ${
                  isSunlightMode
                    ? 'bg-gray-100 border-black text-black'
                    : 'bg-forest-950/80 border-forest-800 text-forest-200'
                }`}
              >
                {HABITAT_TAGS.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Survey Action: Export CSV */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={totalRecordings === 0}
            className={`py-2 px-3.5 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
              totalRecordings === 0
                ? 'opacity-40 cursor-not-allowed bg-gray-600 text-gray-300'
                : isSunlightMode
                  ? 'bg-black text-white hover:bg-gray-800 border-2 border-black'
                  : 'bg-gradient-to-r from-forest-700 to-forest-800 hover:from-forest-600 hover:to-forest-700 text-white border border-forest-500/60'
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
