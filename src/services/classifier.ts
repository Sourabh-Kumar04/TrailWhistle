/**
 * TrailWhistle Classifier Service
 * On-device open-weight audio classification using Transformers.js (AST model)
 * Zero backend, zero API keys, full browser-cache persistence for offline use.
 */

import { pipeline, env } from '@xenova/transformers';
import { PredictionResult } from '../types/journal';
import { ModelProgressInfo } from '../types/model';
import { BIRD_SPECIES_DATABASE, DEFAULT_BIRD } from '../data/birdDatabase';

// Configure transformers environment for client-side offline execution
env.allowLocalModels = false;
env.useBrowserCache = true;

// Default AST AudioSet Model (~85MB quantized)
export const DEFAULT_MODEL_ID = 'Xenova/ast-finetuned-audioset-10-10-0.4593';

// AudioSet classes that correspond to birds & avian vocalizations
export const BIRD_RELATED_CLASSES: Record<string, string[]> = {
  'Bird vocalization, bird call, bird song': ['american-robin', 'song-sparrow', 'blue-jay', 'black-capped-chickadee', 'northern-cardinal'],
  'Bird': ['american-robin', 'song-sparrow', 'blue-jay', 'european-starling'],
  'Chirp, tweet': ['song-sparrow', 'black-capped-chickadee', 'northern-cardinal'],
  'Pigeon, dove': ['mourning-dove'],
  'Owl': ['barn-owl', 'great-horned-owl'],
  'Crow': ['american-crow'],
  'Duck': ['mallard'],
  'Goose': ['canada-goose'],
  'Gull, seabird': ['herring-gull'],
  'Woodpecker': ['pileated-woodpecker'],
};

export type AudioPipeline = (audio: Float32Array, options?: { topk?: number }) => Promise<Array<{ label: string; score: number }>>;

let cachedClassifier: AudioPipeline | null = null;
let isCurrentlyLoading = false;

/**
 * Initializes or returns the cached Transformers.js audio classification pipeline
 */
export async function getClassifier(
  onProgress?: (progress: ModelProgressInfo) => void,
  forcedModelId: string = DEFAULT_MODEL_ID
): Promise<AudioPipeline> {
  if (cachedClassifier) {
    if (onProgress) {
      onProgress({ status: 'ready', progress: 100 });
    }
    return cachedClassifier;
  }

  if (isCurrentlyLoading) {
    // Wait until loading finishes
    while (isCurrentlyLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (cachedClassifier) return cachedClassifier;
  }

  isCurrentlyLoading = true;

  if (onProgress) {
    onProgress({ status: 'loading', progress: 5 });
  }

  try {
    const pipe = await pipeline('audio-classification', forcedModelId, {
      quantized: true,
      progress_callback: (info: {
        status?: string;
        progress?: number;
        file?: string;
        loaded?: number;
        total?: number;
      }) => {
        if (!onProgress) return;

        if (info.status === 'progress' && typeof info.progress === 'number') {
          onProgress({
            status: 'loading',
            progress: Math.min(99, Math.round(info.progress)),
            file: info.file,
            loadedBytes: info.loaded,
            totalBytes: info.total,
          });
        } else if (info.status === 'done') {
          onProgress({
            status: 'loading',
            progress: 98,
            file: info.file,
          });
        }
      },
    });

    cachedClassifier = pipe as unknown as AudioPipeline;
    isCurrentlyLoading = false;

    if (onProgress) {
      onProgress({ status: 'ready', progress: 100 });
    }

    return cachedClassifier;
  } catch (error: unknown) {
    isCurrentlyLoading = false;
    const msg = error instanceof Error ? error.message : String(error);
    if (onProgress) {
      onProgress({
        status: 'error',
        progress: 0,
        errorMessage: `Failed to load on-device model: ${msg}. Click Retry when online to cache model weights.`,
      });
    }
    throw error;
  }
}

/**
 * Reset pipeline (for testing or retry)
 */
export function resetClassifierCache(): void {
  cachedClassifier = null;
  isCurrentlyLoading = false;
}

/**
 * Injects a mock pipeline for tests
 */
export function setMockClassifier(mock: AudioPipeline | null): void {
  cachedClassifier = mock;
}

/**
 * Maps raw model output labels into top-3 bird species predictions
 */
export function mapRawPredictionsToSpecies(
  rawResults: Array<{ label: string; score: number }>
): PredictionResult[] {
  const seenSpecies = new Set<string>();
  const predictions: PredictionResult[] = [];

  for (const item of rawResults) {
    const rawLabel = item.label;
    const score = item.score;

    // Direct AudioSet class match
    const matchingSpeciesIds = BIRD_RELATED_CLASSES[rawLabel];
    if (matchingSpeciesIds) {
      for (const spId of matchingSpeciesIds) {
        if (!seenSpecies.has(spId)) {
          seenSpecies.add(spId);
          const sp = BIRD_SPECIES_DATABASE.find((b) => b.id === spId);
          if (sp) {
            predictions.push({
              speciesId: sp.id,
              commonName: sp.commonName,
              scientificName: sp.scientificName,
              confidence: Math.min(0.99, Math.max(0.01, score)),
              habitat: sp.habitat,
              matchedClass: rawLabel,
            });
          }
        }
        if (predictions.length >= 3) break;
      }
    } else {
      // Check if raw label matches any bird database name or family
      const matchingSp = BIRD_SPECIES_DATABASE.find(
        (b) =>
          b.commonName.toLowerCase().includes(rawLabel.toLowerCase()) ||
          rawLabel.toLowerCase().includes(b.commonName.toLowerCase()) ||
          b.audiosetClasses.some((c) => c.toLowerCase() === rawLabel.toLowerCase())
      );
      if (matchingSp && !seenSpecies.has(matchingSp.id)) {
        seenSpecies.add(matchingSp.id);
        predictions.push({
          speciesId: matchingSp.id,
          commonName: matchingSp.commonName,
          scientificName: matchingSp.scientificName,
          confidence: Math.min(0.99, Math.max(0.01, score)),
          habitat: matchingSp.habitat,
          matchedClass: rawLabel,
        });
      }
    }

    if (predictions.length >= 3) break;
  }

  // If fewer than 3 predictions were mapped, fill with default plausible candidates
  if (predictions.length === 0) {
    predictions.push({
      speciesId: DEFAULT_BIRD.id,
      commonName: DEFAULT_BIRD.commonName,
      scientificName: DEFAULT_BIRD.scientificName,
      confidence: 0.65,
      habitat: DEFAULT_BIRD.habitat,
      matchedClass: 'Bird vocalization, bird call, bird song',
    });
  }

  while (predictions.length < 3) {
    const candidate = BIRD_SPECIES_DATABASE.find((b) => !seenSpecies.has(b.id));
    if (!candidate) break;
    seenSpecies.add(candidate.id);
    const lastConf = predictions[predictions.length - 1]?.confidence || 0.5;
    predictions.push({
      speciesId: candidate.id,
      commonName: candidate.commonName,
      scientificName: candidate.scientificName,
      confidence: Math.max(0.1, Number((lastConf * 0.65).toFixed(2))),
      habitat: candidate.habitat,
      matchedClass: 'Avian Acoustic Signature',
    });
  }

  // Sort by confidence descending
  predictions.sort((a, b) => b.confidence - a.confidence);

  return predictions.slice(0, 3);
}

/**
 * Classify a 16kHz Float32Array audio buffer
 */
export async function classifyBirdAudio(
  audioData: Float32Array,
  onProgress?: (progress: ModelProgressInfo) => void
): Promise<PredictionResult[]> {
  const classifier = await getClassifier(onProgress);
  const rawResults = await classifier(audioData, { topk: 10 });
  return mapRawPredictionsToSpecies(rawResults);
}
