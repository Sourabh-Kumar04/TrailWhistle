import React from 'react';
import { Bird, Mic, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { GeoLocation } from '../types/journal';

interface SurveyStatsBarProps {
  speciesCount: number;
  totalRecordings: number;
  startTime: string;
  location?: GeoLocation | null;
  locationName: string;
  isSunlightMode: boolean;
}

export const SurveyStatsBar: React.FC<SurveyStatsBarProps> = ({
  speciesCount,
  totalRecordings,
  startTime,
  location,
  locationName,
  isSunlightMode,
}) => {
  const startMs = new Date(startTime).getTime();
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - startMs) / 60000));

  const stats = [
    {
      label: 'Species Life Count',
      value: `${speciesCount} ${speciesCount === 1 ? 'Taxon' : 'Species'}`,
      subtext: 'Distinct Avian Taxa',
      icon: Bird,
      highlight: speciesCount > 0,
      accent: 'text-feather-yellow',
    },
    {
      label: 'Acoustic Census',
      value: `${totalRecordings} ${totalRecordings === 1 ? 'Recording' : 'Recordings'}`,
      subtext: 'Inference Detections',
      icon: Mic,
      highlight: totalRecordings > 0,
      accent: 'text-emerald-400',
    },
    {
      label: 'Survey Elapsed',
      value: `${elapsedMinutes} min`,
      subtext: 'Active Session Time',
      icon: Clock,
      highlight: true,
      accent: 'text-sky-400',
    },
    {
      label: 'Transect Coverage',
      value: location ? `±${location.accuracy || 10}m GPS` : 'Transect Fixed',
      subtext: location ? 'Satellite Position Fix' : locationName,
      icon: location ? CheckCircle2 : Navigation,
      highlight: !!location,
      accent: 'text-amber-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {/* Card 1: Species Life Count - Hero stat with glowing badge & pill */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
          isSunlightMode
            ? 'bg-amber-50/70 border-amber-200 text-neutral-900 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-br from-[#1c1908]/90 via-[#131206]/80 to-[#0a0a03]/90 border-amber-500/30 hover:border-amber-400/60 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${
            isSunlightMode ? 'text-amber-900' : 'text-amber-300'
          }`}>
            Species Life Count
          </span>
          <div className={`p-2 rounded-xl shadow-inner ${
            isSunlightMode ? 'bg-amber-200/80 text-amber-900' : 'bg-amber-500/15 text-feather-yellow border border-amber-500/30'
          }`}>
            <Bird className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className={`text-2xl sm:text-3xl font-black tracking-tight font-sans ${
            isSunlightMode ? 'text-amber-950' : 'text-feather-yellow'
          }`}>
            {speciesCount} <span className="text-sm font-semibold tracking-normal text-opacity-80 opacity-80">{speciesCount === 1 ? 'taxon' : 'species'}</span>
          </div>
          <div className={`text-xs font-medium mt-0.5 ${
            isSunlightMode ? 'text-amber-800/80' : 'text-amber-200/70'
          }`}>
            Distinct avian taxa detected
          </div>
        </div>
      </div>

      {/* Card 2: Acoustic Census - High-tech radar style with pulse dot */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
          isSunlightMode
            ? 'bg-emerald-50/70 border-emerald-200 text-neutral-900 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-br from-[#081a10]/90 via-[#05140c]/80 to-[#020a06]/90 border-emerald-500/30 hover:border-emerald-400/60 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${
            isSunlightMode ? 'text-emerald-900' : 'text-emerald-300'
          }`}>
            Acoustic Census
          </span>
          <div className={`p-2 rounded-xl shadow-inner ${
            isSunlightMode ? 'bg-emerald-200/80 text-emerald-950' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
          }`}>
            <Mic className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight font-sans flex items-baseline gap-1.5">
            <span>{totalRecordings}</span>
            <span className={`text-xs font-semibold ${isSunlightMode ? 'text-neutral-600' : 'text-emerald-300/80'}`}>
              {totalRecordings === 1 ? 'recording' : 'recordings'}
            </span>
          </div>
          <div className={`text-xs font-medium mt-0.5 ${
            isSunlightMode ? 'text-emerald-800/80' : 'text-emerald-300/70'
          }`}>
            Inference passes processed
          </div>
        </div>
      </div>

      {/* Card 3: Survey Elapsed - Chronometer layout with active status chip */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
          isSunlightMode
            ? 'bg-sky-50/70 border-sky-200 text-neutral-900 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-br from-[#06151f]/90 via-[#030e17]/80 to-[#02080d]/90 border-sky-500/30 hover:border-sky-400/60 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${
            isSunlightMode ? 'text-sky-900' : 'text-sky-300'
          }`}>
            Survey Elapsed
          </span>
          <div className={`p-2 rounded-xl shadow-inner ${
            isSunlightMode ? 'bg-sky-200/80 text-sky-950' : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
          }`}>
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight font-sans text-sky-400 flex items-baseline gap-1.5">
            <span>{elapsedMinutes}</span>
            <span className={`text-xs font-semibold ${isSunlightMode ? 'text-sky-950' : 'text-sky-200/80'}`}>min active</span>
          </div>
          <div className={`text-xs font-medium mt-0.5 ${
            isSunlightMode ? 'text-sky-800/80' : 'text-sky-300/70'
          }`}>
            Continuous field observation
          </div>
        </div>
      </div>

      {/* Card 4: Transect Coverage - Telemetry fix badge layout */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
          isSunlightMode
            ? 'bg-teal-50/70 border-teal-200 text-neutral-900 shadow-sm hover:shadow-md'
            : 'bg-gradient-to-br from-[#041917]/90 via-[#031311]/80 to-[#010a09]/90 border-teal-500/30 hover:border-teal-400/60 text-white shadow-lg'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold ${
            isSunlightMode ? 'text-teal-900' : 'text-teal-300'
          }`}>
            Transect Coverage
          </span>
          <div className={`p-2 rounded-xl shadow-inner ${
            isSunlightMode ? 'bg-teal-200/80 text-teal-950' : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
          }`}>
            {location ? <CheckCircle2 className="w-4 h-4" /> : <Navigation className="w-4 h-4" />}
          </div>
        </div>
        <div>
          <div className="text-lg sm:text-xl font-bold tracking-tight font-sans truncate">
            {location ? `±${location.accuracy || 10}m GPS` : 'Transect Fixed'}
          </div>
          <div className={`text-xs font-medium truncate mt-0.5 ${
            isSunlightMode ? 'text-teal-800/80' : 'text-teal-300/70'
          }`}>
            {location ? 'Satellite position fix' : locationName}
          </div>
        </div>
      </div>
    </div>
  );
};
