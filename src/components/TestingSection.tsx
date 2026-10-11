import React, { useState } from 'react';
import { FlaskConical, Play, Check, ChevronDown, ChevronUp, Music } from 'lucide-react';
import { SAMPLE_AUDIO_LIST, SampleAudioItem } from '../data/sampleAudio';

interface TestingSectionProps {
  onSelectSample: (sample: SampleAudioItem) => void;
  selectedSample: SampleAudioItem | null;
  isProcessing: boolean;
  isSunlightMode: boolean;
}

export const TestingSection: React.FC<TestingSectionProps> = ({
  onSelectSample,
  selectedSample,
  isProcessing,
  isSunlightMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-xl border transition-all ${
        isSunlightMode
          ? 'bg-white border-2 border-black text-black shadow-sm'
          : 'bg-forest-950/60 border-forest-800/80 text-earth-100 shadow-md'
      }`}
    >
      {/* Collapsible Trigger Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full p-3 sm:p-3.5 flex items-center justify-between text-left transition-colors ${
          isSunlightMode ? 'hover:bg-gray-50' : 'hover:bg-forest-900/40'
        }`}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className={`p-1.5 rounded-lg flex items-center justify-center ${
              isSunlightMode
                ? 'bg-black text-white'
                : 'bg-forest-800 text-feather-yellow'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight">
                Field testing & audio simulation
              </span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                  isSunlightMode
                    ? 'bg-yellow-200 text-black border border-black'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-700/60'
                }`}
              >
                For testing only
              </span>
            </div>
            <p className={`text-[11px] mt-0.5 ${isSunlightMode ? 'text-gray-700' : 'text-forest-300'}`}>
              Simulate live field audio using real pre-bundled xeno-canto recordings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className={`text-[11px] font-semibold hidden sm:inline ${
            isSunlightMode ? 'text-gray-700' : 'text-forest-400'
          }`}>
            {isOpen ? 'Collapse' : 'Expand (4 Clips)'}
          </span>
          <div
            className={`p-1 rounded-lg ${
              isSunlightMode ? 'bg-gray-100 text-black' : 'bg-forest-900 text-forest-300'
            }`}
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Expanded Testing Content */}
      {isOpen && (
        <div className="p-3.5 pt-2 border-t border-forest-800/40 animate-fade-in">
          <div className={`p-2.5 rounded-lg text-xs mb-3 flex items-start gap-2 ${
            isSunlightMode
              ? 'bg-amber-50 border border-amber-300 text-amber-950'
              : 'bg-amber-950/40 border border-amber-800/60 text-amber-200'
          }`}>
            <Music className="w-4 h-4 shrink-0 text-feather-yellow mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Offline QA & Testing:</strong> Tap any sample to feed a 3-second 48kHz audio snippet directly into the BirdNET v2.4 ONNX inference worker and verify real-time classification, checklist updates, and confidence scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {SAMPLE_AUDIO_LIST.map((sample) => {
              const isSelected = selectedSample?.id === sample.id;
              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  disabled={isProcessing}
                  className={`p-2.5 rounded-xl border text-left min-h-[52px] flex items-center justify-between transition-all ${
                    isSelected
                      ? isSunlightMode
                        ? 'bg-black text-white border-black font-bold ring-2 ring-black'
                        : 'bg-forest-700 border-feather-accent text-white font-bold ring-2 ring-forest-500'
                      : isSunlightMode
                        ? 'bg-gray-50 border-gray-300 hover:border-black text-black'
                        : 'bg-forest-950/60 border-forest-800/80 hover:bg-forest-800/60 text-earth-100'
                  }`}
                >
                  <div className="overflow-hidden pr-1">
                    <div className="font-semibold text-xs truncate">{sample.speciesName}</div>
                    <div
                      className={`text-[10px] truncate ${
                        isSelected
                          ? 'text-gray-200'
                          : isSunlightMode
                            ? 'text-gray-600'
                            : 'text-forest-300'
                      }`}
                    >
                      {sample.scientificName}
                    </div>
                  </div>
                  {isSelected ? (
                    <Check className="w-4 h-4 shrink-0 text-feather-yellow" />
                  ) : (
                    <Play className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
