import React, { useState } from 'react';
import { Check, X, MapPin, Search, Feather, Loader2, Navigation } from 'lucide-react';
import { PredictionResult, GeoLocation, JournalEntry } from '../types/journal';
import { BIRD_SPECIES_DATABASE } from '../data/birdDatabase';
import { getCurrentCoordinates } from '../services/geolocation';

interface ConfirmModalProps {
  prediction: PredictionResult;
  allPredictions: PredictionResult[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  audioDuration: number;
  source: 'live_mic' | 'sample_audio';
  isSunlightMode: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  prediction,
  allPredictions,
  isOpen,
  onClose,
  onSave,
  audioDuration,
  source,
  isSunlightMode,
}) => {
  const [selectedCommonName, setSelectedCommonName] = useState(prediction.commonName);
  const [selectedScientificName, setSelectedScientificName] = useState(prediction.scientificName);
  const [confidence, setConfidence] = useState(prediction.confidence);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [isGettingGps, setIsGettingGps] = useState(false);
  const [showSearchSpecies, setShowSearchSpecies] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomSpecies, setIsCustomSpecies] = useState(false);
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleCaptureGps = async () => {
    setIsGettingGps(true);
    try {
      const coords = await getCurrentCoordinates(6000);
      if (coords) {
        setLocation(coords);
      } else {
        alert('GPS location unavailable or permission denied. Note will be saved without GPS.');
      }
    } finally {
      setIsGettingGps(false);
    }
  };

  const handlePickPrediction = (p: PredictionResult) => {
    setSelectedCommonName(p.commonName);
    setSelectedScientificName(p.scientificName);
    setConfidence(p.confidence);
    setIsCustomSpecies(false);
  };

  const handleSelectFromDb = (sp: typeof BIRD_SPECIES_DATABASE[0]) => {
    setSelectedCommonName(sp.commonName);
    setSelectedScientificName(sp.scientificName);
    setConfidence(0.95); // User manual identification
    setIsCustomSpecies(false);
    setShowSearchSpecies(false);
  };

  const handleSave = () => {
    const finalCommonName = isCustomSpecies && customName.trim() ? customName.trim() : selectedCommonName;
    const finalScientificName = isCustomSpecies ? 'Custom field observation' : selectedScientificName;

    onSave({
      commonName: finalCommonName,
      scientificName: finalScientificName,
      confidence,
      notes: notes.trim(),
      location,
      audioDurationSeconds: audioDuration,
      source,
      confirmedByUser: true,
    });
    onClose();
  };

  const filteredSpecies = BIRD_SPECIES_DATABASE.filter((b) =>
    b.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 transition-all shadow-2xl ${
        isSunlightMode ? 'bg-white text-neutral-900 border border-neutral-300' : 'bg-[#06140b] text-white border border-emerald-800/80'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between pb-4 border-b mb-4 ${
          isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/60'
        }`}>
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-feather-yellow" />
            <h3 className="font-extrabold text-lg tracking-tight font-sans">Confirm Field Observation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className={`p-2 min-w-[40px] min-h-[40px] rounded-lg transition-colors cursor-pointer ${
              isSunlightMode ? 'hover:bg-neutral-100 text-neutral-500 hover:text-black' : 'hover:bg-emerald-900 text-neutral-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Bird Summary */}
        <div className={`p-4 rounded-xl border mb-4 transition-all ${
          isSunlightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-[#040e07] border-emerald-900/80'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl sm:text-2xl font-black tracking-tight">{isCustomSpecies && customName ? customName : selectedCommonName}</div>
              <div className={`text-xs italic mt-0.5 ${isSunlightMode ? 'text-neutral-600' : 'text-emerald-300/80'}`}>
                {isCustomSpecies ? 'Manual identification' : selectedScientificName}
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
              isSunlightMode ? 'bg-emerald-50 text-emerald-950 border-emerald-300' : 'bg-emerald-950 text-feather-yellow border-emerald-800'
            }`}>
              {Math.round(confidence * 100)}% match
            </span>
          </div>
        </div>

        {/* Alternate top predictions selector */}
        <div className="mb-4">
          <label className={`block text-xs font-semibold mb-2 ${
            isSunlightMode ? 'text-neutral-700' : 'text-emerald-300'
          }`}>
            Classified candidates:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {allPredictions.map((p) => {
              const isSelected = !isCustomSpecies && selectedCommonName === p.commonName;
              return (
                <button
                  key={p.speciesId}
                  type="button"
                  onClick={() => handlePickPrediction(p)}
                  className={`p-2 rounded-xl border text-xs min-h-[48px] text-left transition-all cursor-pointer ${
                    isSelected
                      ? isSunlightMode
                        ? 'bg-neutral-900 text-white border-neutral-900 font-bold shadow-sm'
                        : 'bg-emerald-700 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/40 shadow-sm'
                      : isSunlightMode
                        ? 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:bg-neutral-100'
                        : 'bg-[#040e07] border-emerald-900/60 text-emerald-200 hover:border-emerald-700'
                  }`}
                >
                  <div className="font-bold line-clamp-1">{p.commonName}</div>
                  <div className="text-[10px] opacity-80 font-mono">{Math.round(p.confidence * 100)}%</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Correction / Search button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowSearchSpecies(!showSearchSpecies)}
            className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all min-h-[44px] cursor-pointer ${
              isSunlightMode
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200'
                : 'bg-emerald-950 border-emerald-800/80 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{showSearchSpecies ? 'Hide Species Database' : 'Search All Species / Correct Entry'}</span>
          </button>

          {showSearchSpecies && (
            <div className={`mt-2 p-3 rounded-xl border ${
              isSunlightMode ? 'bg-neutral-50 border-neutral-300' : 'bg-[#040e07] border-emerald-900/80'
            }`}>
              <input
                type="text"
                placeholder="Search bird name (e.g. Chickadee, Blue Jay)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs mb-2 border outline-none ${
                  isSunlightMode ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black' : 'bg-[#06140b] border-emerald-800 text-white focus:border-emerald-500'
                }`}
              />

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredSpecies.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => handleSelectFromDb(sp)}
                    className={`w-full text-left p-1.5 rounded text-xs flex justify-between transition-colors cursor-pointer ${
                      isSunlightMode ? 'hover:bg-neutral-200 text-neutral-900' : 'hover:bg-emerald-900/60 text-emerald-100'
                    }`}
                  >
                    <span className="font-medium">{sp.commonName}</span>
                    <span className="text-[10px] opacity-70 italic">{sp.scientificName}</span>
                  </button>
                ))}
              </div>

              {/* Custom Bird Input */}
              <div className={`pt-2 mt-2 border-t ${isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/60'}`}>
                <label className="text-[11px] block font-semibold mb-1">Or enter custom unlisted bird:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter custom species..."
                    value={customName}
                    onChange={(e) => {
                      setCustomName(e.target.value);
                      setIsCustomSpecies(true);
                    }}
                    className={`flex-1 p-2 rounded-lg text-xs border outline-none ${
                      isSunlightMode ? 'bg-white border-neutral-300 text-neutral-900' : 'bg-[#06140b] border-emerald-800 text-white'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customName.trim()) {
                        setIsCustomSpecies(true);
                        setShowSearchSpecies(false);
                      }
                    }}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Field Notes */}
        <div className="mb-4">
          <label className={`block text-xs font-semibold mb-1.5 ${
            isSunlightMode ? 'text-neutral-700' : 'text-emerald-300'
          }`}>
            Field notes / trail context:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sighted singing in white pine canopy, 20m off trail."
            className={`w-full p-2.5 rounded-xl text-xs border resize-none min-h-[48px] outline-none ${
              isSunlightMode 
                ? 'bg-white border-neutral-300 text-neutral-900 focus:border-black placeholder-neutral-400' 
                : 'bg-[#040e07] border-emerald-900 text-emerald-100 placeholder-emerald-700/60 focus:border-emerald-500'
            }`}
          />
        </div>

        {/* GPS Capture */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${location ? 'text-emerald-400' : 'text-neutral-500'}`} />
            <div className="text-xs">
              {location ? (
                <span className="font-mono font-semibold text-emerald-400">
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° (±{location.accuracy}m)
                </span>
              ) : (
                <span className={isSunlightMode ? 'text-neutral-600' : 'text-emerald-400/60'}>
                  Offline GPS coordinates optional
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={isGettingGps}
            className={`px-3 py-1.5 min-h-[40px] text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
              location
                ? isSunlightMode
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-emerald-950 border-emerald-700 text-emerald-200'
                : isSunlightMode
                  ? 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200'
                  : 'bg-emerald-950 border-emerald-800 text-feather-yellow hover:bg-emerald-900'
            }`}
          >
            {isGettingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fixing...</span>
              </>
            ) : location ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>GPS Fixed</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Attach GPS</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons (Large touch target) */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`flex-1 py-3 min-h-[48px] rounded-xl font-bold text-sm border transition-all cursor-pointer ${
              isSunlightMode
                ? 'bg-neutral-100 border-neutral-300 text-neutral-900 hover:bg-neutral-200'
                : 'bg-emerald-950 border-emerald-800 text-emerald-200 hover:bg-emerald-900'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`flex-1 py-3 min-h-[48px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
              isSunlightMode
                ? 'bg-emerald-900 text-white hover:bg-emerald-800'
                : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white border border-emerald-400/40 shadow-emerald-950/50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Save to Journal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
