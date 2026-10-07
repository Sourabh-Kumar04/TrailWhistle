export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}

export interface BirdSpecies {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  habitat: string;
  description: string;
  audiosetClasses: string[];
}

export interface PredictionResult {
  speciesId: string;
  commonName: string;
  scientificName: string;
  confidence: number; // 0.0 - 1.0
  habitat: string;
  matchedClass: string;
}

export interface JournalEntry {
  id: string;
  timestamp: string; // ISO string
  commonName: string;
  scientificName: string;
  confidence: number;
  notes: string;
  location?: GeoLocation | null;
  audioDurationSeconds: number;
  source: 'live_mic' | 'sample_audio';
  confirmedByUser: boolean;
}
