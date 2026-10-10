import React from 'react';
import { History, Mic, Music, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { SurveyRecordingEvent } from '../types/journal';

interface RecordingTimelineProps {
  events: SurveyRecordingEvent[];
  isSunlightMode: boolean;
}

export const RecordingTimeline: React.FC<RecordingTimelineProps> = ({
  events,
  isSunlightMode,
}) => {
  if (events.length === 0) return null;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      isSunlightMode
        ? 'bg-white border-2 border-black text-black shadow-md'
        : 'bg-forest-900/60 border-forest-800 text-earth-50 shadow-lg'
    }`}>
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-forest-800/40">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-feather-yellow" />
          <h3 className="font-bold text-sm tracking-tight">Recording History Timeline</h3>
        </div>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
          isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-forest-300'
        }`}>
          {events.length} {events.length === 1 ? 'recording' : 'recordings'} logged
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {events.map((ev, idx) => {
          const time = new Date(ev.timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });

          return (
            <div
              key={ev.id || idx}
              className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                isSunlightMode
                  ? 'bg-gray-50 border-gray-300 text-black'
                  : 'bg-forest-950/70 border-forest-800/80 text-earth-100'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`p-1.5 rounded-lg shrink-0 ${
                  isSunlightMode ? 'bg-gray-200 text-black' : 'bg-forest-800 text-feather-yellow'
                }`}>
                  {ev.source === 'live_mic' ? (
                    <Mic className="w-3 h-3" />
                  ) : (
                    <Music className="w-3 h-3" />
                  )}
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold truncate">{ev.speciesName}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      ev.confidence >= 0.25
                        ? isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-emerald-300'
                        : isSunlightMode ? 'bg-red-100 text-red-900' : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    }`}>
                      {Math.round(ev.confidence * 100)}%
                    </span>
                  </div>
                  <div className={`text-[10px] truncate ${isSunlightMode ? 'text-gray-600' : 'text-forest-400'}`}>
                    {ev.scientificName}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-[10px] opacity-75">{time}</div>
                <div className={`text-[9px] ${isSunlightMode ? 'text-gray-500' : 'text-forest-400'}`}>
                  {ev.durationSeconds}s clip
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
