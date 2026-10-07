import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { ModelDownloadBanner } from './components/ModelDownloadBanner';
import { AudioRecorder } from './components/AudioRecorder';
import { PredictionCard } from './components/PredictionCard';
import { ConfirmModal } from './components/ConfirmModal';
import { JournalList } from './components/JournalList';
import { FieldGuide } from './components/FieldGuide';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { PredictionResult, JournalEntry } from './types/journal';
import { ModelProgressInfo } from './types/model';
import { classifyBirdAudio, resetClassifierCache } from './services/classifier';
import { getJournalEntries, addJournalEntry, deleteJournalEntry, clearJournal } from './services/journal';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'identify' | 'journal' | 'guide'>('identify');
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(() => {
    return localStorage.getItem('trailwhistle_sunlight_mode') === 'true';
  });

  const [modelProgress, setModelProgress] = useState<ModelProgressInfo>({
    status: 'idle',
    progress: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(null);
  const [capturedAudioDuration, setCapturedAudioDuration] = useState(3.0);
  const [capturedSource, setCapturedSource] = useState<'live_mic' | 'sample_audio'>('live_mic');
  const [modalPrediction, setModalPrediction] = useState<PredictionResult | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getJournalEntries());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Toggle sunlight outdoor high-contrast mode
  const handleToggleSunlightMode = () => {
    setIsSunlightMode((prev) => {
      const next = !prev;
      localStorage.setItem('trailwhistle_sunlight_mode', String(next));
      return next;
    });
  };

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Handle incoming audio from live mic or sample
  const handleAudioCaptured = async (
    audioData: Float32Array,
    _wavBlob: Blob,
    source: 'live_mic' | 'sample_audio'
  ) => {
    setIsProcessing(true);
    setCapturedSource(source);
    setCapturedAudioDuration(3.0);

    try {
      const results = await classifyBirdAudio(audioData, (progress) => {
        setModelProgress(progress);
      });
      setPredictions(results);
    } catch (err: unknown) {
      console.error('Classification error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick single-tap confirm
  const handleQuickConfirm = (prediction: PredictionResult) => {
    const newEntry = addJournalEntry({
      commonName: prediction.commonName,
      scientificName: prediction.scientificName,
      confidence: prediction.confidence,
      notes: `Observed via TrailWhistle on-device AI. Signature: ${prediction.matchedClass}`,
      audioDurationSeconds: capturedAudioDuration,
      source: capturedSource,
      confirmedByUser: true,
      location: null,
    });

    setJournalEntries(getJournalEntries());
    setPredictions(null);
    showToast(`Logged "${prediction.commonName}" to Field Journal!`);
  };

  // Save from detailed confirmation modal
  const handleSaveFromModal = (entryData: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    addJournalEntry(entryData);
    setJournalEntries(getJournalEntries());
    setPredictions(null);
    showToast(`Saved "${entryData.commonName}" to Field Journal!`);
  };

  // Delete journal entry
  const handleDeleteEntry = (id: string) => {
    deleteJournalEntry(id);
    setJournalEntries(getJournalEntries());
    showToast('Observation deleted.');
  };

  // Clear all journal entries
  const handleClearJournal = () => {
    clearJournal();
    setJournalEntries([]);
    showToast('Field journal cleared.');
  };

  // Retry model download
  const handleRetryModel = () => {
    resetClassifierCache();
    setModelProgress({ status: 'idle', progress: 0 });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isSunlightMode ? 'bg-[#f8f9fa] text-black' : 'bg-[#0b1710] text-[#f7faf8]'
    }`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSunlightMode={isSunlightMode}
        onToggleSunlightMode={handleToggleSunlightMode}
        journalCount={journalEntries.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 pb-20">
        <PwaInstallBanner isSunlightMode={isSunlightMode} />

        {/* Global Toast */}
        {toastMessage && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className={`px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 text-xs font-bold ${
              isSunlightMode ? 'bg-black text-white' : 'bg-forest-600 text-white border border-forest-400'
            }`}>
              <CheckCircle2 className="w-4 h-4 text-feather-yellow" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        {/* Tab 1: Identify */}
        {activeTab === 'identify' && (
          <div className="space-y-4">
            <ModelDownloadBanner
              progressInfo={modelProgress}
              onRetry={handleRetryModel}
              isSunlightMode={isSunlightMode}
            />

            <AudioRecorder
              onAudioCaptured={handleAudioCaptured}
              isProcessing={isProcessing}
              isSunlightMode={isSunlightMode}
            />

            {predictions && (
              <PredictionCard
                predictions={predictions}
                onConfirm={handleQuickConfirm}
                onOpenEditModal={(p) => setModalPrediction(p)}
                isSunlightMode={isSunlightMode}
              />
            )}
          </div>
        )}

        {/* Tab 2: Field Journal */}
        {activeTab === 'journal' && (
          <JournalList
            entries={journalEntries}
            onDeleteEntry={handleDeleteEntry}
            onClearJournal={handleClearJournal}
            isSunlightMode={isSunlightMode}
            onGoToIdentify={() => setActiveTab('identify')}
          />
        )}

        {/* Tab 3: Touch Grass Field Guide */}
        {activeTab === 'guide' && (
          <FieldGuide isSunlightMode={isSunlightMode} />
        )}
      </main>

      {/* Confirmation & Edit Modal */}
      {modalPrediction && (
        <ConfirmModal
          prediction={modalPrediction}
          allPredictions={predictions || [modalPrediction]}
          isOpen={!!modalPrediction}
          onClose={() => setModalPrediction(null)}
          onSave={handleSaveFromModal}
          audioDuration={capturedAudioDuration}
          source={capturedSource}
          isSunlightMode={isSunlightMode}
        />
      )}

      {/* Outdoor Trail Footer */}
      <footer className={`border-t py-4 text-center text-xs transition-colors ${
        isSunlightMode 
          ? 'border-black text-gray-700 bg-white' 
          : 'border-forest-900 text-forest-400 bg-forest-950/60'
      }`}>
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>TrailWhistle • 100% Offline On-Device AI</span>
          <span>Zero Cloud Telemetry • MIT License</span>
        </div>
      </footer>
    </div>
  );
};
