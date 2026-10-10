import React, { useState } from 'react';
import { MapPin, Mic, Bird, FileSpreadsheet, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface SurveyOnboardingHintProps {
  isSunlightMode: boolean;
}

export const SurveyOnboardingHint: React.FC<SurveyOnboardingHintProps> = ({ isSunlightMode }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('trailwhistle_survey_hint_dismissed') === 'true';
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('trailwhistle_survey_hint_dismissed', 'true');
  };

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  if (isDismissed) {
    return (
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsDismissed(false);
            localStorage.removeItem('trailwhistle_survey_hint_dismissed');
            setIsExpanded(true);
          }}
          className={`text-[11px] font-semibold flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
            isSunlightMode
              ? 'bg-white border-black text-black hover:bg-gray-100'
              : 'bg-forest-950/60 border-forest-800 text-forest-300 hover:text-earth-100'
          }`}
          title="View 4-step survey guide"
        >
          <HelpCircle className="w-3 h-3 text-feather-yellow" />
          <span>Survey Workflow Guide</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-3 sm:p-3.5 rounded-xl border text-xs transition-all ${
        isSunlightMode
          ? 'bg-emerald-50/70 border-emerald-900 text-black'
          : 'bg-forest-950/80 border-forest-800/80 text-earth-100'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 font-bold tracking-tight">
          <HelpCircle className="w-4 h-4 text-feather-yellow shrink-0" />
          <span>Survey Protocol • 4-Step Avian Census Workflow</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleToggleExpand}
            className={`p-1 rounded text-xs flex items-center gap-0.5 opacity-70 hover:opacity-100 ${
              isSunlightMode ? 'text-black' : 'text-forest-300'
            }`}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className={`p-1 rounded opacity-70 hover:opacity-100 ${
              isSunlightMode ? 'text-black' : 'text-forest-400 hover:text-white'
            }`}
            aria-label="Dismiss survey guide"
            title="Dismiss guide"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div
          className={`p-2 rounded-lg border ${
            isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800/70'
          }`}
        >
          <div className="font-bold text-feather-yellow flex items-center gap-1 mb-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span>1. Arrive</span>
          </div>
          <div className="opacity-80 leading-tight">
            Designate survey transect & acquire GPS fix.
          </div>
        </div>

        <div
          className={`p-2 rounded-lg border ${
            isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800/70'
          }`}
        >
          <div className="font-bold text-feather-yellow flex items-center gap-1 mb-0.5">
            <Mic className="w-3 h-3 shrink-0" />
            <span>2. Sample</span>
          </div>
          <div className="opacity-80 leading-tight">
            Capture 3-second rapid acoustic calls across the site.
          </div>
        </div>

        <div
          className={`p-2 rounded-lg border ${
            isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800/70'
          }`}
        >
          <div className="font-bold text-feather-yellow flex items-center gap-1 mb-0.5">
            <Bird className="w-3 h-3 shrink-0" />
            <span>3. Tally</span>
          </div>
          <div className="opacity-80 leading-tight">
            BirdNET v2.4 tallies species frequency & peak confidence.
          </div>
        </div>

        <div
          className={`p-2 rounded-lg border ${
            isSunlightMode ? 'bg-white border-gray-300' : 'bg-forest-900/60 border-forest-800/70'
          }`}
        >
          <div className="font-bold text-feather-yellow flex items-center gap-1 mb-0.5">
            <FileSpreadsheet className="w-3 h-3 shrink-0" />
            <span>4. Export</span>
          </div>
          <div className="opacity-80 leading-tight">
            1-click RFC 4180 CSV export for scientific logs.
          </div>
        </div>
      </div>
    </div>
  );
};
