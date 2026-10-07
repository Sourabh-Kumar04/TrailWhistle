import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from '../components/Navbar';
import { ModelDownloadBanner } from '../components/ModelDownloadBanner';
import { PredictionCard } from '../components/PredictionCard';
import { JournalList } from '../components/JournalList';
import { AudioRecorder } from '../components/AudioRecorder';
import { PredictionResult, JournalEntry } from '../types/journal';

describe('UI Components', () => {
  it('Navbar renders brand and switches tabs', () => {
    const onTabChange = vi.fn();
    const onToggleSunlight = vi.fn();

    render(
      <Navbar
        activeTab="identify"
        onTabChange={onTabChange}
        isSunlightMode={false}
        onToggleSunlightMode={onToggleSunlight}
        journalCount={3}
      />
    );

    expect(screen.getByText('TrailWhistle')).toBeInTheDocument();
    expect(screen.getByText('Offline')).toBeInTheDocument();

    const journalTab = screen.getByText('Journal');
    fireEvent.click(journalTab);
    expect(onTabChange).toHaveBeenCalledWith('journal');

    const sunlightToggle = screen.getByLabelText(/Toggle outdoor sunlight contrast mode/i);
    fireEvent.click(sunlightToggle);
    expect(onToggleSunlight).toHaveBeenCalled();
  });

  it('ModelDownloadBanner displays progress and error with retry', () => {
    const onRetry = vi.fn();

    // Loading state
    const { rerender } = render(
      <ModelDownloadBanner
        progressInfo={{ status: 'loading', progress: 42, file: 'model.onnx' }}
        onRetry={onRetry}
        isSunlightMode={false}
      />
    );
    expect(screen.getByText('42%')).toBeInTheDocument();
    expect(screen.getByText(/Downloading On-Device Audio Model/i)).toBeInTheDocument();

    // Error state
    rerender(
      <ModelDownloadBanner
        progressInfo={{ status: 'error', progress: 0, errorMessage: 'Network timeout' }}
        onRetry={onRetry}
        isSunlightMode={false}
      />
    );
    expect(screen.getByText(/Network timeout/i)).toBeInTheDocument();
    const retryBtn = screen.getByText(/Retry Download/i);
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalled();
  });

  it('PredictionCard displays top species and triggers quick confirm', () => {
    const onConfirm = vi.fn();
    const onOpenEdit = vi.fn();

    const predictions: PredictionResult[] = [
      {
        speciesId: 'american-robin',
        commonName: 'American Robin',
        scientificName: 'Turdus migratorius',
        confidence: 0.89,
        habitat: 'Gardens and woodlands',
        matchedClass: 'Bird vocalization, bird call, bird song',
      },
      {
        speciesId: 'song-sparrow',
        commonName: 'Song Sparrow',
        scientificName: 'Melospiza melodia',
        confidence: 0.45,
        habitat: 'Edge thickets',
        matchedClass: 'Chirp, tweet',
      },
    ];

    render(
      <PredictionCard
        predictions={predictions}
        onConfirm={onConfirm}
        onOpenEditModal={onOpenEdit}
        isSunlightMode={false}
      />
    );

    expect(screen.getByText('American Robin')).toBeInTheDocument();
    expect(screen.getByText('Turdus migratorius')).toBeInTheDocument();
    expect(screen.getByText('89% Confidence')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Quick Confirm');
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledWith(predictions[0]);

    const editBtn = screen.getByText('Add Notes / GPS');
    fireEvent.click(editBtn);
    expect(onOpenEdit).toHaveBeenCalledWith(predictions[0]);
  });

  it('JournalList renders empty state and active observation entries', () => {
    const onDelete = vi.fn();
    const onClear = vi.fn();
    const onGoToIdentify = vi.fn();

    // Empty list
    const { rerender } = render(
      <JournalList
        entries={[]}
        onDeleteEntry={onDelete}
        onClearJournal={onClear}
        isSunlightMode={false}
        onGoToIdentify={onGoToIdentify}
      />
    );

    expect(screen.getByText('No Observations Yet')).toBeInTheDocument();

    // Populated list
    const entries: JournalEntry[] = [
      {
        id: 'entry-1',
        timestamp: '2026-10-07T14:22:00Z',
        commonName: 'Barn Owl',
        scientificName: 'Tyto alba',
        confidence: 0.92,
        notes: 'Heard raspy screech from old barn roof',
        audioDurationSeconds: 3.0,
        source: 'live_mic',
        confirmedByUser: true,
      },
    ];

    rerender(
      <JournalList
        entries={entries}
        onDeleteEntry={onDelete}
        onClearJournal={onClear}
        isSunlightMode={false}
        onGoToIdentify={onGoToIdentify}
      />
    );

    expect(screen.getByText('Barn Owl')).toBeInTheDocument();
    expect(screen.getByText('Tyto alba')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();

    const deleteBtn = screen.getByLabelText(/Delete observation for Barn Owl/i);
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('entry-1');
  });

  it('AudioRecorder renders record button and sample presets', () => {
    const onCapture = vi.fn();
    render(
      <AudioRecorder
        onAudioCaptured={onCapture}
        isProcessing={false}
        isSunlightMode={false}
      />
    );

    expect(screen.getByLabelText(/Record 3 seconds of bird call/i)).toBeInTheDocument();
    expect(screen.getByText(/Desktop \/ Trailhead Demo Clips/i)).toBeInTheDocument();
    expect(screen.getByText('American Robin')).toBeInTheDocument();
    expect(screen.getByText('Barn Owl')).toBeInTheDocument();
  });
});
