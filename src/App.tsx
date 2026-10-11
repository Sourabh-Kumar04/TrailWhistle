import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ModelDownloadBanner } from './components/ModelDownloadBanner';
import { AudioRecorder } from './components/AudioRecorder';
import { PredictionCard } from './components/PredictionCard';
import { ConfirmModal } from './components/ConfirmModal';
import { JournalList } from './components/JournalList';
import { SurveyOnboardingHint } from './components/SurveyOnboardingHint';
import { AreaSurveyHeader } from './components/AreaSurveyHeader';
import { SurveyStatsBar } from './components/SurveyStatsBar';
import { AreaSpeciesChecklist } from './components/AreaSpeciesChecklist';
import { RecordingTimeline } from './components/RecordingTimeline';
import { SpeciesCatalog } from './components/SpeciesCatalog';
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
import { CheckCircle2, AlertCircle, Feather, Compass, BookOpen, Bird, FileSpreadsheet, Radio, ExternalLink } from 'lucide-react';

const DEMO_PREDICTIONS: PredictionResult[] = [
  {
    speciesId: 'amerob',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    matchedClass: 'Turdus migratorius_American Robin',
    confidence: 0.94,
    family: 'Turdidae (Thrushes)',
    habitat: 'Open woodlands, residential lawns, forest edges',
    callType: 'Cheerily carol, clear liquid whistles',
    frequencyBandHz: '1.5 - 3.5 kHz',
    iucnStatus: 'Least Concern (LC)',
  },
  {
    speciesId: 'sonspa',
    commonName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    matchedClass: 'Melospiza melodia_Song Sparrow',
    confidence: 0.38,
    family: 'Passerellidae (New World Sparrows)',
    habitat: 'Shrubby wetlands, hedgerows, forest borders',
    callType: 'Crisp introductory notes followed by musical trill',
    frequencyBandHz: '2.0 - 5.0 kHz',
    iucnStatus: 'Least Concern (LC)',
  },
  {
    speciesId: 'tytalb',
    commonName: 'Barn Owl',
    scientificName: 'Tyto alba',
    matchedClass: 'Tyto alba_Barn Owl',
    confidence: 0.28,
    family: 'Tytonidae (Barn Owls)',
    habitat: 'Open grasslands, agricultural fields, woodland edges',
    callType: 'Harsh raspy screech',
    frequencyBandHz: '0.8 - 2.8 kHz',
    iucnStatus: 'Least Concern (LC)',
  },
];

const DEMO_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'demo-1',
    surveyId: 'survey-pine-ridge',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    confidence: 0.94,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    locationName: 'Pine Ridge Trailhead',
    location: { latitude: 37.7749, longitude: -122.4194, accuracy: 4.2 },
    notes: 'Singing from high pine bough, territorial dawn display.',
    source: 'live_mic',
    audioDurationSeconds: 3.0,
    confirmedByUser: true,
  },
  {
    id: 'demo-2',
    surveyId: 'survey-pine-ridge',
    commonName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    confidence: 0.88,
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    locationName: 'Pine Ridge Trailhead',
    location: { latitude: 37.7753, longitude: -122.4187, accuracy: 5.1 },
    notes: 'Two distinct individuals duetting near riparian willow brush.',
    source: 'sample_audio',
    audioDurationSeconds: 3.0,
    confirmedByUser: true,
  },
  {
    id: 'demo-3',
    surveyId: 'survey-valley-creek',
    commonName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    confidence: 0.91,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    locationName: 'Valley Creek Overlook',
    location: { latitude: 37.7812, longitude: -122.4121, accuracy: 3.8 },
    notes: 'Gentle cooing call, perched on telegraph line wire.',
    source: 'live_mic',
    audioDurationSeconds: 3.0,
    confirmedByUser: false,
  },
];

export const App: React.FC = () => {
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const [activeTab, setActiveTab] = useState<'identify' | 'journal' | 'species'>(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'journal') return 'journal';
    if (tabParam === 'species') return 'species';
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
  const [predictions, setPredictions] = useState<PredictionResult[] | null>(() => {
    if (searchParams?.get('demo') === 'prediction') return DEMO_PREDICTIONS;
    return null;
  });
  const [capturedAudioDuration, setCapturedAudioDuration] = useState(3.0);
  const [capturedSource, setCapturedSource] = useState<'live_mic' | 'sample_audio'>('live_mic');
  const [modalPrediction, setModalPrediction] = useState<PredictionResult | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    if (searchParams?.get('demo') === 'journal' || searchParams?.get('demo') === 'populated') {
      return DEMO_JOURNAL_ENTRIES;
    }
    return getJournalEntries();
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [classificationError, setClassificationError] = useState<string | null>(null);

  // Sync dark class to html documentElement to avoid any theme flash
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isSunlightMode);
      document.documentElement.style.backgroundColor = isSunlightMode ? '#061009' : '#faf9f6';
    }
  }, [isSunlightMode]);

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
    source: 'live_mic' | 'sample_audio',
    sampleHint?: SampleAudioItem | null
  ) => {
    setIsProcessing(true);
    setCapturedSource(source);
    setCapturedAudioDuration(3.0);
    setClassificationError(null);

    try {
      const results = await classifyBirdAudio(
        audioData,
        (progress) => {
          setModelProgress(progress);
        },
        sampleHint ? { expectedSample: sampleHint } : undefined
      );
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
      const msg = err instanceof Error ? err.message : String(err);
      setClassificationError(`Inference issue: ${msg}`);
      showToast(`Inference issue: ${msg}`);
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
      await handleAudioCaptured(rawAudio, wavBlob, 'sample_audio', sample);
    } catch (err: unknown) {
      console.error('Sample load error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setClassificationError(`Could not load test clip: ${sample.speciesName} (${msg})`);
      showToast(`Could not load test clip: ${sample.speciesName}`);
    }
  };

  // Quick single-tap confirm
  const handleQuickConfirm = (prediction: PredictionResult) => {
    addJournalEntry({
      commonName: prediction.commonName,
      scientificName: prediction.scientificName,
      confidence: prediction.confidence,
      notes: 'Identified by sound using on-device AI.',
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
    showToast(`Saved "${saved.commonName}" to Field Log!`);
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
    showToast('Field Log cleared.');
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
      isSunlightMode ? 'bg-[#120D08] text-white' : 'bg-white text-[#332A22]'
    }`}>
      {/* (1) HEADER: dark warm brown bar (#241B12), left logo wordmark, center pill search, right text nav + coral-red pill buttons */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isSunlightMode={isSunlightMode}
        onToggleSunlightMode={handleToggleSunlightMode}
        journalCount={journalEntries.length}
        onStartSurvey={handleNewSurvey}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-bold bg-[#241B12] text-white border border-[#D73C30]">
            <CheckCircle2 className="w-4 h-4 text-[#3D8B40]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full">
        {/* VIEW 1: Survey (Default) */}
        {activeTab === 'identify' && (
          <div className="animate-fade-in">
            {/* (2) HERO: Full-width with nature photo background + dark gradient overlay, large WHITE SERIF headline, small sans subhead, centered. Below: prominent record button */}
            <section
              className="w-full relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(36, 27, 18, 0.78) 0%, rgba(36, 27, 18, 0.65) 50%, rgba(36, 27, 18, 0.92) 100%), url('/hero-nature-bg.jpg')`,
              }}
            >
              <div className="max-w-4xl mx-auto text-center relative z-10">
                {/* Large WHITE SERIF headline */}
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight drop-shadow-md">
                  Hear a bird. Know its name.
                </h1>

                {/* Small sans subhead, centered */}
                <p className="font-sans text-sm sm:text-base md:text-lg text-[#EAE4DC] max-w-2xl mx-auto mt-4 mb-8 leading-relaxed font-normal">
                  Point your phone at the dawn chorus. TrailWhistle recognizes 6,522 bird species using on-device AI — no internet, no account, no waiting.
                </p>

                {/* Prominent record button (embedded in hero with live bioacoustic visualizer) */}
                <div className="max-w-xl mx-auto">
                  <AudioRecorder
                    onAudioCaptured={handleAudioCaptured}
                    isProcessing={isProcessing}
                    isSunlightMode={isSunlightMode}
                    onSelectSample={handleSelectSample}
                    selectedSample={selectedSample}
                    embeddedInHero={true}
                  />

                  {classificationError && (
                    <div className="p-3.5 rounded-xl text-xs flex items-center justify-between gap-2.5 bg-amber-950/80 border border-amber-700 text-amber-200 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
                        <span>{classificationError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setClassificationError(null)}
                        className="text-[10px] font-bold underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {predictions && (
                    <div className="animate-fade-in text-left">
                      <PredictionCard
                        predictions={predictions}
                        onConfirm={handleQuickConfirm}
                        onOpenEditModal={(p) => setModalPrediction(p)}
                        isSunlightMode={isSunlightMode}
                        embeddedInHero={true}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>


            {/* (3) CANONICAL STAT BAND: dark-brown background, 4 columns separated by dividers */}
            <section className="w-full bg-[#1C150E] border-b border-[#3D2E20]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <SurveyStatsBar
                  speciesCount={surveyChecklist.length}
                  totalRecordings={currentSurveyRecordingsCount}
                  startTime={activeSurvey.startTime}
                  location={activeSurvey.location}
                  locationName={activeSurvey.locationName}
                  isSunlightMode={isSunlightMode}
                  sitesCount={DEFAULT_SURVEY_LOCATIONS.length}
                />
              </div>
            </section>

            {/* HOW IT WORKS: plain-language explainer for first-time visitors */}
            <section className="w-full bg-white py-10 sm:py-14 border-b border-[#E5E0D8]">
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-8">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B12] tracking-tight">
                    How it works
                  </h2>
                  <p className="text-sm text-[#736B63] mt-2 font-sans leading-relaxed">
                    TrailWhistle identifies birds by their songs using the open-source BirdNET AI —
                    running entirely on your phone. No internet needed, no recordings uploaded anywhere.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#D73C30]/10 text-[#D73C30] flex items-center justify-center mb-3">
                      <span className="font-serif font-bold text-lg">1</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#241B12] mb-1">Record 3 seconds</h3>
                    <p className="text-xs text-[#736B63] leading-relaxed">
                      Tap record and hold your phone toward the birdsong. Three seconds is all it takes.
                    </p>
                  </div>
                  <div className="text-center px-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#D73C30]/10 text-[#D73C30] flex items-center justify-center mb-3">
                      <span className="font-serif font-bold text-lg">2</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#241B12] mb-1">AI names the bird</h3>
                    <p className="text-xs text-[#736B63] leading-relaxed">
                      BirdNET compares the sound against 6,522 species — on your device, in seconds.
                      Below 25% confidence, it honestly says "Unknown" instead of guessing.
                    </p>
                  </div>
                  <div className="text-center px-4">
                    <div className="w-12 h-12 mx-auto rounded-full bg-[#D73C30]/10 text-[#D73C30] flex items-center justify-center mb-3">
                      <span className="font-serif font-bold text-lg">3</span>
                    </div>
                    <h3 className="font-serif font-bold text-base text-[#241B12] mb-1">Build your field log</h3>
                    <p className="text-xs text-[#736B63] leading-relaxed">
                      Every identification is saved with time and location. Watch your area checklist grow visit after visit.
                    </p>
                  </div>
                </div>
                <p className="text-center text-[11px] text-[#A89B8C] mt-8 max-w-xl mx-auto leading-relaxed">
                  The sample bird calls above are pre-recorded demos so you can try the flow without a microphone.
                  Real recordings from your mic are analyzed on-device by the BirdNET neural network.
                </p>
              </div>
            </section>

            {/* (4) SECTION BANDS: alternate white and warm off-white (#F7F5F2) */}
            
            {/* BAND 1: Warm off-white (#F7F5F2) - Active Survey Station & Detections */}
            <section className="w-full bg-[#F7F5F2] py-10 sm:py-14 border-b border-[#E5E0D8]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B12] tracking-tight">
                    Active survey transect & acoustic telemetry
                  </h2>
                  <p className="text-sm text-[#736B63] mt-1 font-sans">
                    Configure observation site metadata, review on-device neural progress, and inspect live detections.
                  </p>
                </div>

                {/* Area Survey Header */}
                <AreaSurveyHeader
                  survey={activeSurvey}
                  onUpdateSurvey={handleUpdateSurvey}
                  onNewSurvey={handleNewSurvey}
                  onExportCsv={handleExportCurrentSurveyCsv}
                  speciesCount={surveyChecklist.length}
                  totalRecordings={currentSurveyRecordingsCount}
                  isSunlightMode={isSunlightMode}
                />

                {/* Model Download Banner */}
                <ModelDownloadBanner
                  progressInfo={modelProgress}
                  onRetry={handleRetryModel}
                  isSunlightMode={isSunlightMode}
                />

                {/* 4-Step Survey Workflow Protocol */}
                <SurveyOnboardingHint isSunlightMode={isSunlightMode} />

                {/* Latest Inference Species Card (if active) */}
                {predictions && (
                  <div className="max-w-2xl mx-auto">
                    <PredictionCard
                      predictions={predictions}
                      onConfirm={handleQuickConfirm}
                      onOpenEditModal={(p) => setModalPrediction(p)}
                      isSunlightMode={isSunlightMode}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* BAND 2: White (#FFFFFF) - Species Checklist & Area Census */}
            <section className="w-full bg-white py-10 sm:py-14 border-b border-[#E5E0D8]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="text-center max-w-2xl mx-auto mb-6">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B12] tracking-tight">
                    Area species checklist
                  </h2>
                  <p className="text-sm text-[#736B63] mt-1 font-sans">
                    Verified taxa logged at {activeSurvey.locationName} with peak acoustic confidence and frequency counts.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8">
                    <AreaSpeciesChecklist
                      checklist={surveyChecklist}
                      locationName={activeSurvey.locationName}
                      isSunlightMode={isSunlightMode}
                      onRunSampleDemo={() => handleSelectSample(SAMPLE_AUDIO_LIST[0])}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <RecordingTimeline
                      events={surveyTimeline}
                      isSunlightMode={isSunlightMode}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: Species Catalog Tab */}
        {activeTab === 'species' && (
          <div className="animate-fade-in">
            {/* Mini Hero for Species Catalog */}
            <section
              className="w-full relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(36, 27, 18, 0.85) 0%, rgba(36, 27, 18, 0.95) 100%), url('/hero-nature-bg.jpg')`,
              }}
            >
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Explore Bird Species
                </h1>
                <p className="font-sans text-sm sm:text-base text-[#EAE4DC] max-w-xl mx-auto mt-2">
                  Search all 6,522 species BirdNET can recognize, from American Robin to rare warblers.
                </p>
              </div>
            </section>

            <section className="w-full bg-white py-10 sm:py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <SpeciesCatalog
                  detectedChecklist={surveyChecklist}
                  locationName={activeSurvey.locationName}
                  isSunlightMode={isSunlightMode}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </section>
          </div>
        )}

        {/* VIEW 3: Field Log */}
        {activeTab === 'journal' && (
          <div className="animate-fade-in">
            {/* Mini Hero for Field Log */}
            <section
              className="w-full relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(36, 27, 18, 0.85) 0%, rgba(36, 27, 18, 0.95) 100%), url('/hero-nature-bg.jpg')`,
              }}
            >
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Your Field Log
                </h1>
                <p className="font-sans text-sm sm:text-base text-[#EAE4DC] max-w-xl mx-auto mt-2">
                  Every bird you identify, saved with time and location. Export your surveys anytime.
                </p>
              </div>
            </section>

            <section className="w-full bg-[#F7F5F2] py-10 sm:py-14">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <JournalList
                  entries={journalEntries}
                  onDeleteEntry={handleDeleteEntry}
                  onClearJournal={handleClearJournal}
                  isSunlightMode={isSunlightMode}
                  onGoToIdentify={() => setActiveTab('identify')}
                  onJournalImported={(count) => {
                    setJournalEntries(getJournalEntries());
                    showToast(`Restored ${count} observation(s) to Field Log!`);
                  }}
                />
              </div>
            </section>
          </div>
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


      {/* (8) FOOTER: dark brown (#241B12) with link columns */}
      <footer className="w-full bg-[#241B12] text-[#EAE4DC] border-t border-[#3D2E20] pt-12 pb-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 border-b border-[#3D2E20]">
            {/* Column 1: Brand & Cornell Bioacoustics */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#D73C30] text-white flex items-center justify-center">
                  <Feather className="w-4 h-4" />
                </div>
                <span className="font-serif font-bold text-xl text-white tracking-tight">TrailWhistle</span>
              </div>
              <p className="text-xs text-[#B8ACA0] leading-relaxed">
                Identify birds by their songs — right on your phone, even with no signal. Powered by open-source BirdNET AI.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#36291E] border border-[#4E3A2B] text-[#D8CDC2]">
                  100% Offline
                </span>
              </div>
            </div>

            {/* Column 2: Survey Tools */}
            <div className="space-y-2.5">
              <h3 className="font-serif font-bold text-sm text-white uppercase tracking-wider">
                Explore
              </h3>
              <ul className="space-y-2 text-xs text-[#B8ACA0]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('identify')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Record Bird Calls
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('species')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Species Guide
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveTab('journal')}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Field Log
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleExportCurrentSurveyCsv}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Export Survey Data
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="pt-6 text-center text-xs text-[#8A7E73]">© 2026 TrailWhistle</div>
        </div>
      </footer>
    </div>
  );
};
