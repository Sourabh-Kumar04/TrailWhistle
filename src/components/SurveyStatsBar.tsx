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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-3.5 sm:p-4 rounded-xl border transition-all duration-200 group relative overflow-hidden ${
              isSunlightMode
                ? 'bg-white border-neutral-300 text-neutral-900 shadow-sm hover:shadow-md'
                : 'bg-gradient-to-br from-[#0c1b12]/95 via-[#08150e]/95 to-[#050e08]/95 border-emerald-900/50 hover:border-emerald-600/60 text-white shadow-lg'
            }`}
          >
            {/* Subtle top indicator bar */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 opacity-60 ${
              isSunlightMode
                ? 'bg-emerald-800'
                : stat.highlight ? 'bg-gradient-to-r from-emerald-400 to-feather-yellow' : 'bg-emerald-900/30'
            }`} />

            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isSunlightMode ? 'text-neutral-600' : 'text-emerald-400/80'
              }`}>
                {stat.label}
              </span>
              <div className={`p-1 rounded-md ${
                isSunlightMode ? 'bg-neutral-100 text-emerald-950' : 'bg-emerald-950/60 ' + stat.accent
              }`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-lg sm:text-xl font-black tracking-tight font-sans">
              {stat.value}
            </div>

            <div className={`text-[11px] font-medium truncate mt-0.5 ${
              isSunlightMode ? 'text-neutral-500' : 'text-emerald-300/60'
            }`}>
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
