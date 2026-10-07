/**
 * TrailWhistle Field Journal Service
 * LocalStorage persistence, filtering, search, and CSV export.
 * Zero cloud dependency.
 */

import { JournalEntry } from '../types/journal';

export const JOURNAL_STORAGE_KEY = 'trailwhistle_field_journal_v1';

export function getJournalEntries(): JournalEntry[] {
  try {
    const raw = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error('Failed to parse journal entries from localStorage', e);
    return [];
  }
}

export function saveJournalEntries(entries: JournalEntry[]): void {
  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save journal entries to localStorage', e);
  }
}

export function addJournalEntry(entry: Omit<JournalEntry, 'id' | 'timestamp'> & { timestamp?: string }): JournalEntry {
  const entries = getJournalEntries();
  const newEntry: JournalEntry = {
    ...entry,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `entry-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
  };

  entries.unshift(newEntry);
  saveJournalEntries(entries);
  return newEntry;
}

export function deleteJournalEntry(id: string): boolean {
  const entries = getJournalEntries();
  const filtered = entries.filter((e) => e.id !== id);
  if (filtered.length !== entries.length) {
    saveJournalEntries(filtered);
    return true;
  }
  return false;
}

export function clearJournal(): void {
  localStorage.removeItem(JOURNAL_STORAGE_KEY);
}

export interface JournalFilterOptions {
  query?: string;
  startDate?: string;
  endDate?: string;
  confirmedOnly?: boolean;
}

export function filterJournalEntries(
  entries: JournalEntry[],
  filters: JournalFilterOptions
): JournalEntry[] {
  return entries.filter((entry) => {
    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      const matchCommon = entry.commonName.toLowerCase().includes(q);
      const matchScientific = entry.scientificName.toLowerCase().includes(q);
      const matchNotes = entry.notes.toLowerCase().includes(q);
      if (!matchCommon && !matchScientific && !matchNotes) {
        return false;
      }
    }

    if (filters.confirmedOnly && !entry.confirmedByUser) {
      return false;
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      const entryTime = new Date(entry.timestamp).getTime();
      if (entryTime < start) return false;
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      const entryTime = new Date(entry.timestamp).getTime();
      if (entryTime > end) return false;
    }

    return true;
  });
}

/**
 * Escapes a field for CSV according to RFC 4180
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts journal entries to RFC 4180 formatted CSV
 */
export function generateJournalCsv(entries: JournalEntry[]): string {
  const headers = [
    'id',
    'timestamp_utc',
    'species_common_name',
    'species_scientific_name',
    'confidence_pct',
    'notes',
    'latitude',
    'longitude',
    'gps_accuracy_m',
    'audio_duration_sec',
    'source',
    'confirmed_by_user',
  ];

  const rows = entries.map((e) => [
    escapeCsvField(e.id),
    escapeCsvField(e.timestamp),
    escapeCsvField(e.commonName),
    escapeCsvField(e.scientificName),
    escapeCsvField((e.confidence * 100).toFixed(1) + '%'),
    escapeCsvField(e.notes),
    escapeCsvField(e.location?.latitude ?? ''),
    escapeCsvField(e.location?.longitude ?? ''),
    escapeCsvField(e.location?.accuracy ?? ''),
    escapeCsvField(e.audioDurationSeconds),
    escapeCsvField(e.source),
    escapeCsvField(e.confirmedByUser ? 'yes' : 'no'),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

/**
 * Triggers browser download of journal entries as a CSV file
 */
export function exportJournalToCsvFile(entries: JournalEntry[]): void {
  const csvContent = generateJournalCsv(entries);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `trailwhistle_field_journal_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
