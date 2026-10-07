import React, { useState } from 'react';
import { Search, Download, Trash2, MapPin, Calendar, CheckCircle2, Feather, FileSpreadsheet } from 'lucide-react';
import { JournalEntry } from '../types/journal';
import { filterJournalEntries, exportJournalToCsvFile } from '../services/journal';

interface JournalListProps {
  entries: JournalEntry[];
  onDeleteEntry: (id: string) => void;
  onClearJournal: () => void;
  isSunlightMode: boolean;
  onGoToIdentify: () => void;
}

export const JournalList: React.FC<JournalListProps> = ({
  entries,
  onDeleteEntry,
  onClearJournal,
  isSunlightMode,
  onGoToIdentify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [confirmedOnly, setConfirmedOnly] = useState(false);

  const filteredEntries = filterJournalEntries(entries, {
    query: searchQuery,
    startDate: filterDate ? `${filterDate}T00:00:00Z` : undefined,
    endDate: filterDate ? `${filterDate}T23:59:59Z` : undefined,
    confirmedOnly,
  });

  const handleExportCsv = () => {
    if (entries.length === 0) {
      alert('Your field journal is empty. Make an observation first!');
      return;
    }
    exportJournalToCsvFile(filteredEntries.length > 0 ? filteredEntries : entries);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear your local field journal? This cannot be undone.')) {
      onClearJournal();
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Header: Search & Export */}
      <div className={`p-4 rounded-2xl border transition-all ${
        isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-900/60 border-forest-800 text-earth-50'
      }`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
              <Feather className="w-5 h-5 text-feather-yellow" />
              Field Journal
            </h2>
            <p className={`text-xs ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
              {entries.length} {entries.length === 1 ? 'observation' : 'observations'} recorded offline in localStorage
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={entries.length === 0}
              className={`flex-1 sm:flex-none py-2 px-3.5 min-h-[44px] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                entries.length === 0
                  ? 'opacity-40 cursor-not-allowed bg-gray-500 text-white'
                  : isSunlightMode
                    ? 'bg-black text-white hover:bg-gray-800 border-2 border-black'
                    : 'bg-forest-700 hover:bg-forest-600 text-white border border-forest-500'
              }`}
              title="Export all observations as standard CSV file"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            {entries.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className={`py-2 px-3 min-h-[44px] rounded-xl text-xs font-bold border transition-all ${
                  isSunlightMode
                    ? 'border-red-600 text-red-700 hover:bg-red-50'
                    : 'border-red-800 text-red-300 hover:bg-red-950/60'
                }`}
                title="Clear all journal records"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-forest-800/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search species or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 min-h-[44px] rounded-xl text-xs border ${
                isSunlightMode 
                  ? 'bg-gray-50 border-gray-300 text-black' 
                  : 'bg-forest-950 border-forest-800 text-earth-100 placeholder-forest-500'
              }`}
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Calendar className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 min-h-[44px] rounded-xl text-xs border ${
                  isSunlightMode 
                    ? 'bg-gray-50 border-gray-300 text-black' 
                    : 'bg-forest-950 border-forest-800 text-earth-100'
                }`}
              />
            </div>
            {filterDate && (
              <button
                type="button"
                onClick={() => setFilterDate('')}
                className="px-2 text-xs font-bold underline opacity-70"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className={`p-8 rounded-2xl border text-center ${
          isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-900/40 border-forest-800 text-earth-100'
        }`}>
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-forest-800/40 flex items-center justify-center text-feather-yellow">
            <Feather className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold mb-1">
            {entries.length === 0 ? 'No Observations Yet' : 'No Matching Observations'}
          </h3>
          <p className={`text-xs max-w-sm mx-auto mb-4 ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
            {entries.length === 0 
              ? 'Head outside onto your local trail or park. Tap the Record button to identify bird calls offline.'
              : 'Try clearing your search query or date filter.'}
          </p>
          {entries.length === 0 && (
            <button
              type="button"
              onClick={onGoToIdentify}
              className={`px-5 py-2.5 min-h-[48px] rounded-xl font-bold text-xs inline-flex items-center gap-2 shadow-md transition-all ${
                isSunlightMode
                  ? 'bg-black text-white hover:bg-gray-800 border-2 border-black'
                  : 'bg-forest-600 hover:bg-forest-500 text-white'
              }`}
            >
              <span>Record a Bird Call</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => {
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const formattedTime = date.toLocaleTimeString(undefined, {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={entry.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSunlightMode
                    ? 'bg-white border-black text-black shadow-sm'
                    : 'bg-forest-900/70 border-forest-800 text-earth-100 hover:border-forest-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-base">{entry.commonName}</h4>
                      {entry.confirmedByUser && (
                        <span title="Confirmed by user">
                          <CheckCircle2 className="w-4 h-4 text-forest-400" />
                        </span>
                      )}
                    </div>
                    <div className={`text-xs italic ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
                      {entry.scientificName}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow'
                    }`}>
                      {Math.round(entry.confidence * 100)}%
                    </span>
                    <div className={`text-[10px] mt-1 ${isSunlightMode ? 'text-gray-600' : 'text-forest-400'}`}>
                      {formattedDate} • {formattedTime}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {entry.notes && (
                  <p className={`text-xs p-2.5 rounded-lg mb-2 ${
                    isSunlightMode ? 'bg-gray-100 text-black' : 'bg-forest-950/80 text-earth-200'
                  }`}>
                    {entry.notes}
                  </p>
                )}

                {/* Footer details: GPS & Delete */}
                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-forest-800/40">
                  <div className="flex items-center gap-3">
                    {entry.location ? (
                      <span className="flex items-center gap-1 font-mono text-forest-400">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {entry.location.latitude.toFixed(4)}°, {entry.location.longitude.toFixed(4)}°
                        {entry.location.accuracy && ` (±${entry.location.accuracy}m)`}
                      </span>
                    ) : (
                      <span className="opacity-60 italic">No GPS attached</span>
                    )}
                    <span className="opacity-75">
                      {entry.source === 'live_mic' ? 'Live Mic' : 'Sample Song'} ({entry.audioDurationSeconds}s)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 min-w-[36px] min-h-[36px] flex items-center justify-center rounded text-red-400 hover:text-red-300 hover:bg-forest-800"
                    title="Delete entry"
                    aria-label={`Delete observation for ${entry.commonName}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
