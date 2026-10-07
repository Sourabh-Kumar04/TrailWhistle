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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 transition-all ${
        isSunlightMode ? 'bg-white text-black border-2 border-black' : 'bg-forest-950 text-earth-50 border border-forest-700'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-forest-800/60 mb-4">
          <div className="flex items-center gap-2">
            <Feather className="w-5 h-5 text-feather-yellow" />
            <h3 className="font-bold text-lg">Confirm Field Observation</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 min-w-[40px] min-h-[40px] rounded-lg hover:bg-forest-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Bird Summary */}
        <div className={`p-4 rounded-xl border mb-4 ${
          isSunlightMode ? 'bg-gray-100 border-black' : 'bg-forest-900/80 border-forest-700'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-black">{isCustomSpecies && customName ? customName : selectedCommonName}</div>
              <div className={`text-xs italic ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
                {isCustomSpecies ? 'Manual identification' : selectedScientificName}
              </div>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-800 text-feather-yellow'
            }`}>
              {Math.round(confidence * 100)}% match
            </span>
          </div>
        </div>

        {/* Alternate top predictions selector */}
        <div className="mb-4">
          <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
            isSunlightMode ? 'text-gray-800' : 'text-forest-300'
          }`}>
            Classified Candidates:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {allPredictions.map((p) => {
              const isSelected = !isCustomSpecies && selectedCommonName === p.commonName;
              return (
                <button
                  key={p.speciesId}
                  type="button"
                  onClick={() => handlePickPrediction(p)}
                  className={`p-2 rounded-xl border text-xs min-h-[48px] text-left transition-all ${
                    isSelected
                      ? isSunlightMode
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-forest-700 border-feather-accent text-white font-bold ring-2 ring-feather-accent'
                      : isSunlightMode
                        ? 'bg-gray-50 border-gray-300 text-gray-800'
                        : 'bg-forest-900/60 border-forest-800 text-forest-200 hover:bg-forest-800'
                  }`}
                >
                  <div className="font-semibold line-clamp-1">{p.commonName}</div>
                  <div className="text-[10px] opacity-80">{Math.round(p.confidence * 100)}%</div>
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
            className={`w-full py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-1.5 transition-all min-h-[44px] ${
              isSunlightMode
                ? 'bg-gray-200 border-black text-black hover:bg-gray-300'
                : 'bg-forest-900/90 border-forest-700 text-forest-200 hover:bg-forest-800'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{showSearchSpecies ? 'Hide Species Database' : 'Search All Species / Correct Entry'}</span>
          </button>

          {showSearchSpecies && (
            <div className={`mt-2 p-3 rounded-xl border ${
              isSunlightMode ? 'bg-gray-50 border-black' : 'bg-forest-900 border-forest-700'
            }`}>
              <input
                type="text"
                placeholder="Search bird name (e.g. Chickadee, Blue Jay)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-2 rounded-lg text-xs mb-2 border ${
                  isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-950 border-forest-700 text-white'
                }`}
              />

              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {filteredSpecies.map((sp) => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => handleSelectFromDb(sp)}
                    className="w-full text-left p-1.5 rounded hover:bg-forest-800 text-xs flex justify-between"
                  >
                    <span className="font-medium">{sp.commonName}</span>
                    <span className="text-[10px] opacity-70 italic">{sp.scientificName}</span>
                  </button>
                ))}
              </div>

              {/* Custom Bird Input */}
              <div className="pt-2 mt-2 border-t border-forest-800/80">
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
                    className={`flex-1 p-2 rounded text-xs border ${
                      isSunlightMode ? 'bg-white border-black text-black' : 'bg-forest-950 border-forest-700 text-white'
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
                    className="px-3 py-1 bg-feather-accent text-white font-bold rounded text-xs"
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
          <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
            isSunlightMode ? 'text-gray-800' : 'text-forest-300'
          }`}>
            Field Notes / Trail Context:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sighted singing in white pine canopy, 20m off trail."
            className={`w-full p-2.5 rounded-xl text-xs border resize-none min-h-[48px] ${
              isSunlightMode 
                ? 'bg-white border-black text-black' 
                : 'bg-forest-900/90 border-forest-700 text-earth-100 placeholder-forest-500'
            }`}
          />
        </div>

        {/* GPS Capture */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className={`w-4 h-4 ${location ? 'text-forest-400' : 'text-gray-500'}`} />
            <div className="text-xs">
              {location ? (
                <span className="font-mono font-semibold">
                  {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° (±{location.accuracy}m)
                </span>
              ) : (
                <span className={isSunlightMode ? 'text-gray-600' : 'text-forest-400'}>
                  Offline GPS coordinates optional
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={isGettingGps}
            className={`px-3 py-1.5 min-h-[40px] text-xs font-bold rounded-lg border flex items-center gap-1.5 transition-all ${
              location
                ? 'bg-forest-800 border-forest-600 text-forest-200'
                : isSunlightMode
                  ? 'bg-gray-100 border-black text-black hover:bg-gray-200'
                  : 'bg-forest-900 border-forest-700 text-feather-yellow hover:bg-forest-800'
            }`}
          >
            {isGettingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Fixing...</span>
              </>
            ) : location ? (
              <>
                <Check className="w-3.5 h-3.5 text-forest-400" />
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
            className={`flex-1 py-3 min-h-[48px] rounded-xl font-bold text-sm border transition-all ${
              isSunlightMode
                ? 'bg-gray-200 border-black text-black hover:bg-gray-300'
                : 'bg-forest-900 border-forest-700 text-forest-200 hover:bg-forest-800'
            }`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`flex-1 py-3 min-h-[48px] rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
              isSunlightMode
                ? 'bg-black text-white border-2 border-black hover:bg-gray-900'
                : 'bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-500 hover:to-forest-600 text-white border border-forest-500'
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
