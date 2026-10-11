import React from 'react';
import { GeoLocation } from '../types/journal';

interface SurveyStatsBarProps {
  speciesCount: number;
  totalRecordings: number;
  startTime: string;
  location?: GeoLocation | null;
  locationName: string;
  isSunlightMode: boolean;
  sitesCount?: number;
}

export const SurveyStatsBar: React.FC<SurveyStatsBarProps> = ({
  speciesCount,
  totalRecordings,
  startTime,
  location,
  locationName: _locationName,
  isSunlightMode,
  sitesCount = 4,
}) => {
  const startMs = new Date(startTime).getTime();
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startMs) / 60000));
  const surveyTimeDisplay = elapsedMinutes < 60 ? `${elapsedMinutes}m` : `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;

  return (
    <div
      className={`w-full transition-all duration-200 border rounded-xl overflow-hidden shadow-sm ${
        isSunlightMode
          ? 'bg-[#120D08] border-[#4A3A2C] text-white shadow-xl'
          : 'bg-white border-[#E5E0D8] text-[#1C1610]'
      }`}
    >
      {/* 4 Columns Separated by Thin Vertical Dividers */}
      <div className={`grid grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x ${
        isSunlightMode ? 'divide-[#4A3A2C]' : 'divide-[#E5E0D8]'
      }`}>
        {/* Column 1: Species Found */}
        <div className="p-5 sm:p-7 flex flex-col items-center justify-center text-center">
          <div
            className={`text-4xl sm:text-5xl font-bold font-sans tracking-tight leading-none ${
              isSunlightMode ? 'text-white' : 'text-[#1C1610]'
            }`}
          >
            {speciesCount}
          </div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#736B63] mt-2">
            Species Found
          </div>
        </div>

        {/* Column 2: Recordings */}
        <div className="p-5 sm:p-7 flex flex-col items-center justify-center text-center">
          <div
            className={`text-4xl sm:text-5xl font-bold font-sans tracking-tight leading-none ${
              isSunlightMode ? 'text-white' : 'text-[#1C1610]'
            }`}
          >
            {totalRecordings}
          </div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#736B63] mt-2">
            Recordings
          </div>
        </div>

        {/* Column 3: Survey Time */}
        <div className="p-5 sm:p-7 flex flex-col items-center justify-center text-center">
          <div
            className={`text-4xl sm:text-5xl font-bold font-sans tracking-tight leading-none ${
              isSunlightMode ? 'text-white' : 'text-[#1C1610]'
            }`}
          >
            {surveyTimeDisplay}
          </div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#736B63] mt-2">
            Survey Time
          </div>
        </div>

        {/* Column 4: Sites */}
        <div className="p-5 sm:p-7 flex flex-col items-center justify-center text-center">
          <div
            className={`text-4xl sm:text-5xl font-bold font-sans tracking-tight leading-none ${
              isSunlightMode ? 'text-white' : 'text-[#1C1610]'
            }`}
          >
            {sitesCount}
          </div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#736B63] mt-2 flex items-center justify-center gap-1">
            <span>Sites</span>
            {location && (
              <span className="text-[10px] text-[#3D8B40] font-mono font-normal">
                (±{location.accuracy || 10}m)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
