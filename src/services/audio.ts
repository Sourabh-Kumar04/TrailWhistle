/**
 * TrailWhistle Audio Service
 * Web Audio API capture, iOS Safari webkitAudioContext fallback,
 * 16kHz resampling for Transformers.js models, and WAV blob generation.
 */

// Safe AudioContext getter with iOS Safari webkit fallback
export function getAudioContextClass(): typeof AudioContext {
  const ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
  if (!ctx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }
  return ctx;
}

export function createAudioContext(sampleRate?: number): AudioContext {
  const AudioCtx = getAudioContextClass();
  if (sampleRate) {
    try {
      return new AudioCtx({ sampleRate });
    } catch {
      // Fallback for browsers that don't support sampleRate option in constructor
      return new AudioCtx();
    }
  }
  return new AudioCtx();
}

/**
 * Resample a Float32Array from sourceSampleRate to targetSampleRate (e.g., 16000Hz)
 * Uses high-quality linear interpolation.
 */
export function resampleTo16kHz(
  audioData: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number = 16000
): Float32Array {
  if (sourceSampleRate === targetSampleRate) {
    return audioData;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const targetLength = Math.round(audioData.length / ratio);
  const result = new Float32Array(targetLength);

  for (let i = 0; i < targetLength; i++) {
    const originalPos = i * ratio;
    const index1 = Math.floor(originalPos);
    const index2 = Math.min(index1 + 1, audioData.length - 1);
    const weight = originalPos - index1;

    result[i] = audioData[index1] * (1 - weight) + audioData[index2] * weight;
  }

  return result;
}

/**
 * Normalize float audio data to range [-1.0, 1.0] to maximize SNR for model feature extractor
 */
export function normalizeAudio(audio: Float32Array): Float32Array {
  let maxAbs = 0;
  for (let i = 0; i < audio.length; i++) {
    const abs = Math.abs(audio[i]);
    if (abs > maxAbs) maxAbs = abs;
  }

  if (maxAbs === 0 || maxAbs === 1) {
    return audio;
  }

  const factor = 0.95 / maxAbs;
  const normalized = new Float32Array(audio.length);
  for (let i = 0; i < audio.length; i++) {
    normalized[i] = audio[i] * factor;
  }
  return normalized;
}

/**
 * Convert Float32Array (mono 16kHz) to a playable WAV Blob
 */
export function float32ToWavBlob(samples: Float32Array, sampleRate: number = 16000): Blob {
  const numSamples = samples.length;
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  function writeString(offset: number, str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  }

  // RIFF identifier
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  // format chunk identifier
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16-bit
  // data chunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Write PCM samples
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: 'audio/wav' });
}

export interface AudioCaptureController {
  stop: () => Promise<Float32Array>;
  cancel: () => void;
}

/**
 * Records audio from user microphone for durationSeconds (default 3.0s)
 * Handles iOS audio context suspension and microphone permission errors
 */
export async function recordMicAudio(
  durationSeconds: number = 3.0,
  onVolumeChange?: (volume: number) => void
): Promise<{ rawAudio: Float32Array; wavBlob: Blob }> {
  // Check navigator.mediaDevices support
  if (!navigator?.mediaDevices?.getUserMedia) {
    throw new Error('Microphone recording is not supported in this browser. Please use HTTPS or sample audio.');
  }

  const audioContext = createAudioContext();

  // iOS Safari requires explicit resume upon user gesture
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
      },
    });
  } catch (err: unknown) {
    await audioContext.close().catch(() => {});
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Permission denied') || msg.includes('NotAllowedError')) {
      throw new Error('Microphone permission denied. Enable mic access or test with built-in audio samples.');
    }
    throw new Error(`Microphone capture error: ${msg}`);
  }

  const source = audioContext.createMediaStreamSource(stream);
  // ScriptProcessor or AudioWorklet for universal compatibility including mobile Safari
  const bufferSize = 4096;
  const scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1);
  const recordedChunks: Float32Array[] = [];

  scriptProcessor.onaudioprocess = (e) => {
    const inputData = e.inputBuffer.getChannelData(0);
    recordedChunks.push(new Float32Array(inputData));

    if (onVolumeChange) {
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      onVolumeChange(Math.min(1.0, rms * 5)); // Scaled RMS volume
    }
  };

  source.connect(scriptProcessor);
  scriptProcessor.connect(audioContext.destination);

  // Wait for durationSeconds
  await new Promise((resolve) => setTimeout(resolve, durationSeconds * 1000));

  // Disconnect & cleanup
  source.disconnect();
  scriptProcessor.disconnect();
  stream.getTracks().forEach((track) => track.stop());

  const sourceSampleRate = audioContext.sampleRate;
  await audioContext.close().catch(() => {});

  // Merge recorded chunks
  const totalLength = recordedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const combined = new Float32Array(totalLength);
  let offset = 0;
  for (const chunk of recordedChunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  // Resample to 16kHz
  const resampled = resampleTo16kHz(combined, sourceSampleRate, 16000);
  const normalized = normalizeAudio(resampled);
  const wavBlob = float32ToWavBlob(normalized, 16000);

  return { rawAudio: normalized, wavBlob };
}

/**
 * Loads an audio file from URL, decodes it with Web Audio, and returns 16kHz Float32Array
 */
export async function loadAudioFromUrl(url: string): Promise<{ rawAudio: Float32Array; wavBlob: Blob }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load audio sample from ${url}: status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioContext = createAudioContext();

  try {
    const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const channelData = decodedBuffer.getChannelData(0);
    const resampled = resampleTo16kHz(channelData, decodedBuffer.sampleRate, 16000);
    const normalized = normalizeAudio(resampled);
    const wavBlob = float32ToWavBlob(normalized, 16000);
    return { rawAudio: normalized, wavBlob };
  } finally {
    await audioContext.close().catch(() => {});
  }
}
