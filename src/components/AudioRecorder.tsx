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
    <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
      isSunlightMode 
        ? 'bg-white border-2 border-black text-black shadow-md' 
        : 'bg-canopy-900/95 border-forest-700/60 text-earth-50 shadow-lg'
    }`}>
      {/* Header Badge */}
      <div className={`flex items-center justify-between pb-3 mb-4 border-b ${
        isSunlightMode ? 'border-neutral-900' : 'border-forest-800/60'
      }`}>
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider">Acoustic Field Recorder</h2>
        </div>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
          isSunlightMode ? 'bg-black text-white' : 'bg-canopy-950 text-forest-200 border border-forest-700'
        }`}>
          48kHz Worklet
        </span>
      </div>

      {/* Capture Section */}
      <div className="flex flex-col items-center justify-center text-center">
        <h3 className="text-base sm:text-lg font-black tracking-tight mb-1 font-sans">
          {isRecording 
            ? 'Listening to Nature...' 
            : isProcessing 
              ? 'Classifying Avian Acoustics...' 
              : 'Record 3 Seconds of Birdsong'}
        </h3>
        <p className={`text-xs mb-5 max-w-sm ${isSunlightMode ? 'text-black font-medium' : 'text-forest-200'}`}>
          Hold your device towards the canopy or brush. Three seconds is all BirdNET v2.4 needs for on-device inference.
        </p>

        {/* Big Tap Target Record Button */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Animated pulse rings when recording */}
          {isRecording && (
            <div
              className="absolute w-36 h-36 rounded-full border-4 border-feather-accent animate-ping opacity-60"
              style={{ transform: `scale(${1 + volume * 0.4})` }}
            />
          )}

          <button
            type="button"
            onClick={handleStartRecording}
            disabled={isRecording || isProcessing}
            aria-label={isRecording ? 'Recording in progress' : 'Record 3 seconds of bird call'}
            className={`w-28 h-28 min-w-[112px] min-h-[112px] rounded-full flex flex-col items-center justify-center transition-all transform active:scale-95 shadow-2xl select-none relative z-10 ${
              isRecording
                ? 'bg-red-600 text-white ring-8 ring-red-400/30'
                : isProcessing
                  ? 'bg-forest-800 text-gray-300 cursor-not-allowed opacity-80'
                  : isSunlightMode
                    ? 'bg-black text-white hover:bg-neutral-800 border-4 border-black font-bold'
                    : 'bg-gradient-to-br from-moss-500 via-forest-600 to-forest-700 hover:from-moss-400 hover:to-forest-600 text-white border-2 border-moss-300/50 shadow-lg'
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-8 h-8 fill-current mb-1" />
                <span className="font-mono font-bold text-xs">{countdown.toFixed(1)}s</span>
              </>
            ) : isProcessing ? (
              <>
                <Sparkles className="w-8 h-8 animate-pulse text-feather-yellow mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Inferring</span>
              </>
            ) : (
              <>
                <Mic className="w-9 h-9 mb-1" />
                <span className="text-xs font-bold uppercase tracking-wide">Record</span>
              </>
            )}
          </button>
        </div>

        {/* Live Audio Visualizer / Bioacoustic Spectrum Meter */}
        {isRecording && (
          <div className="w-56 mb-4 space-y-1.5 animate-fade-in">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 font-bold">
                <Volume2 className="w-3.5 h-3.5 text-feather-yellow" />
                <span>48kHz Acoustic Input</span>
              </span>
              <span className="font-bold">{Math.round(volume * 100)}% RMS</span>
            </div>
            
            {/* Primary RMS Level */}
            <div className={`w-full h-2 rounded-full overflow-hidden ${isSunlightMode ? 'bg-neutral-300' : 'bg-canopy-950'}`}>
              <div
                className={`h-full transition-all duration-75 ${isSunlightMode ? 'bg-black' : 'bg-gradient-to-r from-moss-500 to-feather-yellow'}`}
                style={{ width: `${Math.min(100, Math.max(6, volume * 100))}%` }}
              />
            </div>

            {/* 4 Bioacoustic Frequency Bands (Sub-1.5k, 1.5-3k, 3-6k, 6k+) */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {[
                { label: '0.5-1.5k', height: Math.min(100, Math.max(12, volume * 80 + 10)) },
                { label: '1.5-3.0k', height: Math.min(100, Math.max(15, volume * 110 + 15)) },
                { label: '3.0-6.0k', height: Math.min(100, Math.max(18, volume * 95 + 12)) },
                { label: '6.0k+', height: Math.min(100, Math.max(10, volume * 65 + 8)) },
              ].map((band, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className={`w-full h-4 rounded overflow-hidden flex items-end ${
                    isSunlightMode ? 'bg-neutral-200' : 'bg-canopy-950 border border-forest-800/80'
                  }`}>
                    <div
                      className={`w-full transition-all duration-100 ${
                        isSunlightMode ? 'bg-black' : 'bg-emerald-400'
                      }`}
                      style={{ height: `${band.height}%` }}
                    />
                  </div>
                  <span className={`text-[8px] font-mono ${isSunlightMode ? 'text-black font-bold' : 'text-forest-400'}`}>
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
              className={`px-3 py-1.5 min-h-[40px] rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                isSunlightMode
                  ? 'bg-gray-100 hover:bg-gray-200 border border-black text-black'
                  : 'bg-forest-800 hover:bg-forest-700 text-forest-100 border border-forest-600'
              }`}
            >
              <Play className={`w-3.5 h-3.5 ${isPlayingPreview ? 'fill-current' : ''}`} />
              <span>{isPlayingPreview ? 'Playing Captured Audio...' : 'Replay 3s Clip'}</span>
            </button>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className={`p-3 rounded-lg text-xs flex items-center gap-2 mb-4 w-full text-left ${
            isSunlightMode ? 'bg-red-50 border border-red-500 text-red-900' : 'bg-red-950/80 border border-red-700 text-red-200'
          }`}>
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Quick Field Test Simulator for Immediate 30s Discovery */}
        {onSelectSample && (
          <div className={`w-full pt-3 mt-2 border-t ${
            isSunlightMode ? 'border-neutral-900' : 'border-forest-800/60'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isSunlightMode ? 'text-black font-extrabold' : 'text-forest-200'
              }`}>
                <FlaskConical className="w-3.5 h-3.5 text-feather-yellow" />
                <span>Simulate Field Call:</span>
              </span>
              <span className={`text-[10px] font-mono ${
                isSunlightMode ? 'text-black font-bold' : 'text-forest-400'
              }`}>
                48kHz xeno-canto
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 w-full">
              {SAMPLE_AUDIO_LIST.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                return (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => onSelectSample(sample)}
                    disabled={isRecording || isProcessing}
                    className={`p-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-all min-h-[44px] ${
                      isSelected
                        ? isSunlightMode
                          ? 'bg-black text-white font-extrabold ring-2 ring-black'
                          : 'bg-moss-700 text-white border border-moss-400 shadow-sm'
                        : isSunlightMode
                          ? 'bg-neutral-100 border-2 border-black hover:bg-neutral-200 text-black font-bold'
                          : 'bg-canopy-950/90 border border-forest-800 hover:border-forest-600 text-forest-100 hover:text-white'
                    }`}
                    title={`Run on-device BirdNET inference on ${sample.speciesName}`}
                  >
                    <span className="truncate pr-1">{sample.speciesName}</span>
                    <Play className="w-3.5 h-3.5 shrink-0 opacity-80" />
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
