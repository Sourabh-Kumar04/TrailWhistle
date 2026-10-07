import { describe, it, expect, beforeEach } from 'vitest';
import {
  mapRawPredictionsToSpecies,
  classifyBirdAudio,
  setMockClassifier,
  resetClassifierCache,
  BIRD_RELATED_CLASSES,
} from '../services/classifier';

describe('Classifier Service & AudioSet Species Mapping', () => {
  beforeEach(() => {
    resetClassifierCache();
  });

  it('maps AudioSet classes into species predictions', () => {
    const rawResults = [
      { label: 'Owl', score: 0.89 },
      { label: 'Bird vocalization, bird call, bird song', score: 0.72 },
      { label: 'Chirp, tweet', score: 0.65 },
    ];

    const mapped = mapRawPredictionsToSpecies(rawResults);

    expect(mapped).toHaveLength(3);
    // Owl should map to Barn Owl or Great Horned Owl
    expect(mapped[0].commonName).toMatch(/Owl/);
    expect(mapped[0].confidence).toBe(0.89);
    expect(mapped[0].matchedClass).toBe('Owl');
  });

  it('handles Pigeon and Dove audio classification mapping', () => {
    const rawResults = [
      { label: 'Pigeon, dove', score: 0.91 },
    ];

    const mapped = mapRawPredictionsToSpecies(rawResults);
    expect(mapped.length).toBeGreaterThanOrEqual(1);
    expect(mapped[0].commonName).toBe('Mourning Dove');
    expect(mapped[0].confidence).toBe(0.91);
  });

  it('populates up to 3 candidate species when model returns fewer', () => {
    const rawResults = [
      { label: 'Crow', score: 0.8 },
    ];

    const mapped = mapRawPredictionsToSpecies(rawResults);
    expect(mapped).toHaveLength(3);
    expect(mapped[0].commonName).toBe('American Crow');
    expect(mapped[1].confidence).toBeLessThan(0.8);
  });

  it('uses mock classifier pipeline without performing real network downloads', async () => {
    const mockPipe = async (_audio: Float32Array) => [
      { label: 'Bird vocalization, bird call, bird song', score: 0.93 },
      { label: 'Chirp, tweet', score: 0.82 },
    ];

    setMockClassifier(mockPipe as any);

    const dummyAudio = new Float32Array(16000);
    const results = await classifyBirdAudio(dummyAudio);

    expect(results).toHaveLength(3);
    expect(results[0].confidence).toBe(0.93);
    expect(results[0].commonName).toBeDefined();
  });
});
