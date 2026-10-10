import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { ModelDownloadBanner } from './components/ModelDownloadBanner';
import { AudioRecorder } from './components/AudioRecorder';
import { PredictionCard } from './components/PredictionCard';
import { ConfirmModal } from './components/ConfirmModal';
import { JournalList } from './components/JournalList';
import { SurveyOnboardingHint } from './components/SurveyOnboardingHint';
import { TestingSection } from './components/TestingSection';
import { AreaSurveyHeader } from './components/AreaSurveyHeader';
import { SurveyStatsBar } from './components/SurveyStatsBar';
import { AreaSpeciesChecklist } from './components/AreaSpeciesChecklist';
import { RecordingTimeline } from './components/RecordingTimeline';
import { PredictionResult, JournalEntry, SurveySession, SurveyRecordingEvent } from './types/journal';
import { ModelProgressInfo } from './types/model';
import { SampleAudioItem, SAMPLE_AUDIO_LIST } from './data/sampleAudio';
import { loadAudioFromUrl } from './services/audio';
import { classifyBirdAudio, resetClassifierCache } from './services/classifier';
import {
  getJournalEntries,
  addJournalEntry,
  deleteJournalEntry,
  clearJournal,
  getActiveSurvey,
  saveActiveSurvey,
  resetActiveSurvey,
  getSurveyTimeline,
  addSurveyTimelineEvent,
  clearSurveyTimeline,
  buildSurveyChecklist,
  exportAreaSurveyCsvFile,
  DEFAULT_SURVEY_LOCATIONS,
} from './services/journal';
import { CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [activeTab, setActiveTab] = useState<'identify' | 'journal'>(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'journal') return 'journal';
    return 'identify';
  });
  const [isSunlightMode, setIsSunlightMode] = useState<boolean>(() => {
    if (searchParams?.get('mode') === 'sunlight') return true;
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

  // Area Biodiversity Survey Session State
  const [activeSurvey, setActiveSurvey] = useState<SurveySession>(() => getActiveSurvey());
  const [surveyTimeline, setSurveyTimeline] = useState<SurveyRecordingEvent[]>(() => getSurveyTimeline());

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

  // Compute live survey checklist from journal entries matching this survey or location
  const surveyChecklist = useMemo(() => {
    return buildSurveyChecklist(journalEntries, activeSurvey.id, activeSurvey.locationName);
  }, [journalEntries, activeSurvey.id, activeSurvey.locationName]);

  // Compute total recordings made during active survey
  const currentSurveyRecordingsCount = useMemo(() => {
    const fromTimeline = surveyTimeline.length;
    const fromJournal = journalEntries.filter(
      (e) => e.surveyId === activeSurvey.id || (e.locationName && e.locationName === activeSurvey.locationName)
    ).length;
    return Math.max(fromTimeline, fromJournal);
  }, [surveyTimeline.length, journalEntries, activeSurvey.id, activeSurvey.locationName]);

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

      // Record to survey timeline
      if (results && results.length > 0) {
        const top = results[0];
        const isUnknown = top.speciesId === 'unknown' || top.confidence < 0.25;
        addSurveyTimelineEvent({
          speciesName: isUnknown ? 'Inconclusive Audio (<25%)' : top.commonName,
          scientificName: isUnknown ? 'Background acoustics or distant call' : top.scientificName,
          confidence: top.confidence,
          source,
          durationSeconds: 3.0,
          isUnknown,
        });
        setSurveyTimeline(getSurveyTimeline());
      }
    } catch (err: unknown) {
      console.error('Classification error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const [selectedSample, setSelectedSample] = useState<SampleAudioItem | null>(null);

  // Handle testing with pre-bundled sample audio clips
  const handleSelectSample = async (sample: SampleAudioItem) => {
    if (isProcessing) return;
    setSelectedSample(sample);
    try {
      const { rawAudio, wavBlob } = await loadAudioFromUrl(sample.url);
      await handleAudioCaptured(rawAudio, wavBlob, 'sample_audio');
    } catch (err: unknown) {
      console.error('Sample load error:', err);
      showToast(`Could not load test clip: ${sample.speciesName}`);
    }
  };

  // Quick single-tap confirm
  const handleQuickConfirm = (prediction: PredictionResult) => {
    addJournalEntry({
      commonName: prediction.commonName,
      scientificName: prediction.scientificName,
      confidence: prediction.confidence,
      notes: `Observed via TrailWhistle on-device AI. Signature: ${prediction.matchedClass}`,
      audioDurationSeconds: capturedAudioDuration,
      source: capturedSource,
      confirmedByUser: true,
      location: activeSurvey.location || null,
      locationName: activeSurvey.locationName,
      surveyId: activeSurvey.id,
    });

    setJournalEntries(getJournalEntries());
    setPredictions(null);
    showToast(`Logged "${prediction.commonName}" to ${activeSurvey.locationName} checklist!`);
  };

  // Save from detailed confirmation modal
  const handleSaveFromModal = (entryData: Omit<JournalEntry, 'id' | 'timestamp'>) => {
    const saved = addJournalEntry({
      ...entryData,
      locationName: entryData.locationName || activeSurvey.locationName,
      surveyId: entryData.surveyId || activeSurvey.id,
    });

    // If GPS was fixed in modal, attach it to active survey as well
    if (entryData.location && !activeSurvey.location) {
      const updatedSurvey = { ...activeSurvey, location: entryData.location };
      saveActiveSurvey(updatedSurvey);
      setActiveSurvey(updatedSurvey);
    }

    setJournalEntries(getJournalEntries());
    setPredictions(null);
    showToast(`Saved "${saved.commonName}" to Field Journal!`);
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
    clearSurveyTimeline();
    setSurveyTimeline([]);
    showToast('Field journal cleared.');
  };

  // Update active survey metadata
  const handleUpdateSurvey = (updated: SurveySession) => {
    saveActiveSurvey(updated);
    setActiveSurvey(updated);
  };

  // Start new survey session
  const handleNewSurvey = () => {
    const currentIndex = DEFAULT_SURVEY_LOCATIONS.indexOf(activeSurvey.locationName);
    const nextLoc = DEFAULT_SURVEY_LOCATIONS[(currentIndex + 1) % DEFAULT_SURVEY_LOCATIONS.length];
    const newSession = resetActiveSurvey(nextLoc);
    setActiveSurvey(newSession);
    setSurveyTimeline([]);
    setPredictions(null);
    showToast(`Started new Area Survey at "${newSession.locationName}"`);
  };

  // Export current area survey CSV
  const handleExportCurrentSurveyCsv = () => {
    const currentSurveyEntries = journalEntries.filter(
      (e) => e.surveyId === activeSurvey.id || (e.locationName && e.locationName === activeSurvey.locationName)
    );
    exportAreaSurveyCsvFile(
      activeSurvey.locationName,
      currentSurveyEntries.length > 0 ? currentSurveyEntries : journalEntries,
      activeSurvey
    );
    showToast(`Exported CSV survey report for ${activeSurvey.locationName}`);
  };

  // Retry model download
  const handleRetryModel = () => {
    resetClassifierCache();
    setModelProgress({ status: 'idle', progress: 0 });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isSunlightMode ? 'bg-white text-black' : 'bg-[#07130b] text-[#f7faf8]'
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
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20">
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

        {/* Tab 1: Identify & Area Biodiversity Survey Mode */}
        {activeTab === 'identify' && (
          <div className="space-y-5 animate-fade-in">
            {/* Prominent Area Biodiversity Survey Header */}
            <AreaSurveyHeader
              survey={activeSurvey}
              onUpdateSurvey={handleUpdateSurvey}
              onNewSurvey={handleNewSurvey}
              onExportCsv={handleExportCurrentSurveyCsv}
              speciesCount={surveyChecklist.length}
              totalRecordings={currentSurveyRecordingsCount}
              isSunlightMode={isSunlightMode}
            />

            {/* Prominent Survey Stats Bar (Full-Width Overview) */}
            <SurveyStatsBar
              speciesCount={surveyChecklist.length}
              totalRecordings={currentSurveyRecordingsCount}
              startTime={activeSurvey.startTime}
              location={activeSurvey.location}
              locationName={activeSurvey.locationName}
              isSunlightMode={isSunlightMode}
            />

            {/* Model Download Banner (Only expands during download/ready/error) */}
            <ModelDownloadBanner
              progressInfo={modelProgress}
              onRetry={handleRetryModel}
              isSunlightMode={isSunlightMode}
            />

            {/* Compact 4-Step Survey Workflow Guide */}
            <SurveyOnboardingHint isSunlightMode={isSunlightMode} />

            {/* Two-Column Side-by-Side Survey Layout on Desktop/Tablet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Acoustic Field Recorder (with Quick Test Pills) & Latest Inference */}
              <div className="lg:col-span-5 space-y-4">
                <AudioRecorder
                  onAudioCaptured={handleAudioCaptured}
                  isProcessing={isProcessing}
                  isSunlightMode={isSunlightMode}
                  onSelectSample={handleSelectSample}
                  selectedSample={selectedSample}
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

              {/* Right Column: Live Species Checklist & Timeline */}
              <div className="lg:col-span-7 space-y-4">
                <AreaSpeciesChecklist
                  checklist={surveyChecklist}
                  locationName={activeSurvey.locationName}
                  isSunlightMode={isSunlightMode}
                  onRunSampleDemo={() => handleSelectSample(SAMPLE_AUDIO_LIST[0])}
                />

                <RecordingTimeline
                  events={surveyTimeline}
                  isSunlightMode={isSunlightMode}
                />
              </div>
            </div>

            {/* Demoted Collapsible Testing Section at Bottom */}
            <TestingSection
              onSelectSample={handleSelectSample}
              selectedSample={selectedSample}
              isProcessing={isProcessing}
              isSunlightMode={isSunlightMode}
            />
          </div>
        )}

        {/* Tab 2: Field Survey Log (Journal) */}
        {activeTab === 'journal' && (
          <JournalList
            entries={journalEntries}
            onDeleteEntry={handleDeleteEntry}
            onClearJournal={handleClearJournal}
            isSunlightMode={isSunlightMode}
            onGoToIdentify={() => setActiveTab('identify')}
            onJournalImported={(count) => {
              setJournalEntries(getJournalEntries());
              showToast(`Restored ${count} observation(s) to Field Journal!`);
            }}
          />
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
          ? 'border-black text-black bg-white font-semibold' 
          : 'border-forest-900/80 text-forest-300 bg-canopy-950/95'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1">
          <span>TrailWhistle • Area Biodiversity Survey Tool • BirdNET v2.4 (6,522 Species)</span>
          <span>100% On-Device Offline AI • Zero Cloud Telemetry • MIT License</span>
        </div>
      </footer>
    </div>
  );
};
