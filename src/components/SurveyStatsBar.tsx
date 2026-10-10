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
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
              isSunlightMode
                ? 'bg-white border-black text-black shadow-sm'
                : 'bg-forest-900/60 border-forest-800/80 text-earth-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                isSunlightMode ? 'text-gray-700' : 'text-forest-300'
              }`}>
                {stat.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${isSunlightMode ? 'text-black' : stat.accent}`} />
            </div>

            <div className="text-base sm:text-lg font-black tracking-tight font-sans">
              {stat.value}
            </div>

            <div className={`text-[10px] truncate ${
              isSunlightMode ? 'text-gray-600' : 'text-forest-400'
            }`}>
              {stat.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
