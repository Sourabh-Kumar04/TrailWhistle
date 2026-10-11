import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Sparkles, Volume2, AlertCircle, Radio, FlaskConical } from 'lucide-react';
import { recordMicAudio } from '../services/audio';
import { SAMPLE_AUDIO_LIST, SampleAudioItem } from '../data/sampleAudio';

interface AudioRecorderProps {
  onAudioCaptured: (audioData: Float32Array, wavBlob: Blob, source: 'live_mic' | 'sample_audio') => void;
  isProcessing: boolean;
  isSunlightMode: boolean;
  onSelectSample?: (sample: SampleAudioItem) => void;
  selectedSample?: SampleAudioItem | null;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onAudioCaptured,
  isProcessing,
  isSunlightMode,
  onSelectSample,
  selectedSample,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(3.0);
  const [volume, setVolume] = useState(0);
  const [recordedWavUrl, setRecordedWavUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (recordedWavUrl) URL.revokeObjectURL(recordedWavUrl);
    };
  }, [recordedWavUrl]);

  // Handle 3-second live microphone capture
  const handleStartRecording = async () => {
    if (isRecording || isProcessing) return;

    setErrorMessage(null);
    setRecordedWavUrl(null);
    setIsRecording(true);
    setCountdown(3.0);
    setVolume(0.1);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 3.0 - elapsed);
      setCountdown(Number(remaining.toFixed(1)));
      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);

    try {
      const { rawAudio, wavBlob } = await recordMicAudio(3.0, (vol) => {
        setVolume(vol);
      });

      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRecording(false);
      setVolume(0);

      const blobUrl = URL.createObjectURL(wavBlob);
      setRecordedWavUrl(blobUrl);

      onAudioCaptured(rawAudio, wavBlob, 'live_mic');
    } catch (err: unknown) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsRecording(false);
      setVolume(0);
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    }
  };

  const handleTogglePreview = () => {
    if (!audioPreviewRef.current || !recordedWavUrl) return;

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.currentTime = 0;
      audioPreviewRef.current.play().catch(() => {});
      setIsPlayingPreview(true);
    }
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
      isSunlightMode 
        ? 'bg-white border-neutral-300 text-neutral-900 shadow-md' 
        : 'bg-gradient-to-br from-[#0c1b12]/95 via-[#08150e]/95 to-[#040c07]/95 border-emerald-800/50 text-earth-50 shadow-2xl'
    }`}>
      {/* Ambient background glow behind the sensor */}
      {!isSunlightMode && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header Badge */}
      <div className={`flex items-center justify-between pb-3.5 mb-5 border-b relative z-10 ${
        isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/40'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg ${
            isSunlightMode ? 'bg-emerald-100 text-emerald-950' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-700/50'
          }`}>
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className={`text-sm font-bold font-sans ${isSunlightMode ? 'text-neutral-900' : 'text-emerald-100'}`}>
              Acoustic field recorder
            </h2>
            <p className={`text-[11px] ${isSunlightMode ? 'text-neutral-600' : 'text-emerald-300/70'}`}>
              Real-time on-device audio worklet
            </p>
          </div>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
          isSunlightMode 
            ? 'bg-neutral-100 text-neutral-900 border border-neutral-300' 
            : 'bg-emerald-950/90 text-emerald-300 border border-emerald-700/60 shadow-inner'
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>48kHz Worklet</span>
        </span>
      </div>

      {/* Capture Section */}
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight mb-1 font-sans">
          {isRecording 
            ? 'Sampling Canopy Acoustics...' 
            : isProcessing 
              ? 'Inferring BirdNET v2.4 Neural Core...' 
              : 'Record 3 Seconds of Birdsong'}
        </h3>
        <p className={`text-xs mb-6 max-w-sm leading-relaxed ${isSunlightMode ? 'text-neutral-600 font-medium' : 'text-emerald-300/70'}`}>
          Aim microphone toward trees or shrubs. High-fidelity 48kHz audio is analyzed locally on device.
        </p>

        {/* Big Tap Target Record Button with Glowing Sonar Rings */}
        <div className="relative mb-6 flex items-center justify-center group">
          {/* Subtle outer ambient pulse halo in idle */}
          {!isRecording && !isProcessing && (
            <div className={`absolute w-36 h-36 rounded-full transition-all duration-700 group-hover:scale-110 opacity-40 ${
              isSunlightMode ? 'bg-neutral-200' : 'bg-emerald-500/20 blur-md'
            }`} />
          )}

          {/* Dynamic Sonar Rings when recording */}
          {isRecording && (
            <>
              <div
                className="absolute w-44 h-44 rounded-full border-2 border-red-500/40 animate-ping"
                style={{ transform: `scale(${1.1 + volume * 0.5})` }}
              />
              <div
                className="absolute w-36 h-36 rounded-full border-2 border-red-400/60 animate-pulse"
                style={{ transform: `scale(${1 + volume * 0.3})` }}
              />
            </>
          )}

          {/* Tactile Record Button */}
          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isRecording || isProcessing}
            aria-label={isRecording ? 'Recording in progress' : 'Record 3 seconds of bird call'}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl select-none relative z-10 cursor-pointer ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-700 text-white ring-8 ring-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.5)]'
                : isProcessing
                  ? 'bg-emerald-950 text-emerald-300 cursor-not-allowed border-2 border-emerald-700/60 opacity-90'
                  : isSunlightMode
                    ? 'bg-emerald-900 hover:bg-emerald-800 text-white border-4 border-emerald-700 hover:scale-105 shadow-xl shadow-emerald-950/20'
                    : 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-forest-800 hover:from-emerald-400 hover:to-forest-700 text-white border-2 border-emerald-300/40 hover:scale-105 shadow-[0_0_40px_rgba(16,185,129,0.35)]'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-9 h-9 fill-current mb-1 animate-pulse" />
                <span className="font-mono font-black text-sm tracking-wider">{countdown.toFixed(1)}s</span>
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-9 h-9 animate-spin text-feather-yellow mb-1" />
                <span className="text-xs font-bold text-feather-yellow">Classifying...</span>
              </>
            ) : (
              <>
                <div className="p-2.5 rounded-full bg-white/10 mb-1">
                  <Mic className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold tracking-normal">Record</span>
              </>
            )}
          </button>
        </div>

        {/* Live Audio Visualizer / Bioacoustic Spectrum Meter */}
        {isRecording && (
          <div className="w-64 mb-5 space-y-2 animate-fade-in p-3 rounded-xl bg-black/40 border border-emerald-900/50">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Volume2 className="w-3.5 h-3.5 text-feather-yellow" />
                <span>Bioacoustic Level</span>
              </span>
              <span className="font-bold text-feather-yellow">{Math.round(volume * 100)}% RMS</span>
            </div>
            
            {/* Primary RMS Level Bar */}
            <div className={`w-full h-2 rounded-full overflow-hidden ${isSunlightMode ? 'bg-neutral-300' : 'bg-[#050e08]'}`}>
              <div
                className={`h-full transition-all duration-75 rounded-full ${
                  isSunlightMode ? 'bg-emerald-900' : 'bg-gradient-to-r from-emerald-400 via-feather-yellow to-red-500 shadow-sm'
                }`}
                style={{ width: `${Math.min(100, Math.max(6, volume * 100))}%` }}
              />
            </div>

            {/* 4 Bioacoustic Frequency Bands */}
            <div className="flex items-center justify-between gap-1.5 pt-1">
              {[
                { label: '0.5-1.5k', height: Math.min(100, Math.max(12, volume * 80 + 10)) },
                { label: '1.5-3.0k', height: Math.min(100, Math.max(15, volume * 110 + 15)) },
                { label: '3.0-6.0k', height: Math.min(100, Math.max(18, volume * 95 + 12)) },
                { label: '6.0k+', height: Math.min(100, Math.max(10, volume * 65 + 8)) },
              ].map((band, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-5 rounded-md overflow-hidden flex items-end ${
                    isSunlightMode ? 'bg-neutral-200' : 'bg-[#050e08] border border-emerald-950'
                  }`}>
                    <div
                      className={`w-full transition-all duration-100 rounded-t ${
                        isSunlightMode ? 'bg-emerald-900' : 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                      }`}
                      style={{ height: `${band.height}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-semibold ${isSunlightMode ? 'text-neutral-700' : 'text-emerald-400/70'}`}>
                    {band.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playback preview for last captured audio */}
        {recordedWavUrl && !isRecording && (
          <div className="mb-4 flex items-center gap-2">
            <audio
              ref={audioPreviewRef}
              src={recordedWavUrl}
              onEnded={() => setIsPlayingPreview(false)}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleTogglePreview}
              className={`px-4 py-2 min-h-[40px] rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                isSunlightMode
                  ? 'bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 text-neutral-900'
                  : 'bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/60 shadow-emerald-950/40'
              }`}
            >
              <Play className={`w-3.5 h-3.5 text-feather-yellow ${isPlayingPreview ? 'fill-current' : ''}`} />
              <span>{isPlayingPreview ? 'Playing Captured Audio...' : 'Replay 3s Captured Audio'}</span>
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 mb-4 w-full text-left ${
            isSunlightMode ? 'bg-red-50 border border-red-300 text-red-900' : 'bg-red-950/80 border border-red-700 text-red-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Field Test Simulator for Immediate 30s Discovery */}
        {onSelectSample && (
          <div className={`w-full pt-4 mt-2 border-t ${
            isSunlightMode ? 'border-neutral-200' : 'border-emerald-900/40'
          }`}>
            <div className="flex items-center justify-between mb-2.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                isSunlightMode ? 'text-neutral-800' : 'text-emerald-200'
              }`}>
                <FlaskConical className="w-3.5 h-3.5 text-feather-yellow" />
                <span>Simulate field call:</span>
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                isSunlightMode ? 'bg-neutral-100 text-neutral-600' : 'bg-emerald-950 text-emerald-400 border border-emerald-900'
              }`}>
                48kHz xeno-canto
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              {SAMPLE_AUDIO_LIST.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => onSelectSample(sample)}
                    disabled={isRecording || isProcessing}
                    className={`p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all min-h-[44px] cursor-pointer group ${
                      isSelected
                        ? isSunlightMode
                          ? 'bg-emerald-900 text-white font-extrabold shadow-sm'
                          : 'bg-emerald-800 text-white border border-emerald-400 shadow-md shadow-emerald-950/50'
                        : isSunlightMode
                          ? 'bg-neutral-100 border border-neutral-300 hover:bg-neutral-200 text-neutral-900'
                          : 'bg-[#06120a] border border-emerald-900/70 hover:border-emerald-600 hover:bg-[#0a1a0f] text-emerald-100'
                    }`}
                    title={`Run on-device BirdNET inference on ${sample.speciesName}`}
                  >
                    <div className="truncate pr-1">
                      <div className="truncate font-semibold">{sample.speciesName}</div>
                      <div className={`text-[10px] font-mono font-normal truncate ${
                        isSelected ? 'opacity-80' : 'opacity-60'
                      }`}>
                        3.0s sample
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                      isSelected
                        ? 'bg-white text-emerald-900'
                        : isSunlightMode ? 'bg-neutral-200 text-neutral-800' : 'bg-emerald-950 text-feather-yellow'
                    }`}>
                      <Play className="w-3 h-3 fill-current" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
