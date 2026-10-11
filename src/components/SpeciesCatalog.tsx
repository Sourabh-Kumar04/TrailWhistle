import React, { useState, useRef } from 'react';
import { Bird, MapPin, Volume2, Search, Play, Pause, Trees, ShieldCheck, Sparkles } from 'lucide-react';
import { SurveyChecklistItem } from '../types/journal';

export interface DemoSpeciesCardItem {
  id: string;
  commonName: string;
  scientificName: string;
  family: string;
  habitat: string;
  description: string;
  vocalization: string;
  frequencyBandHz: string;
  iucnStatus: string;
  image: string;
  audioUrl: string;
}

export const DEMO_SPECIES_LIST: DemoSpeciesCardItem[] = [
  {
    id: 'demo-robin',
    commonName: 'American Robin',
    scientificName: 'Turdus migratorius',
    family: 'Turdidae (Thrushes)',
    habitat: 'Open woodlands, suburban lawns, parks, riparian borders',
    description: 'Cheerily carol-like musical whistles and territorial dawn chorus displays.',
    vocalization: 'Cheerily carol, clear liquid rising and falling whistles',
    frequencyBandHz: '2.2 kHz – 4.5 kHz',
    iucnStatus: 'Least Concern (LC)',
    image: '/images/american-robin.svg',
    audioUrl: '/samples/american-robin.wav',
  },
  {
    id: 'demo-sparrow',
    commonName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    family: 'Passerellidae (New World Sparrows)',
    habitat: 'Shrubby wetlands, hedgerows, riparian brush, woodland edges',
    description: 'Crisp introductory notes followed by an energetic buzz and variable musical trill.',
    vocalization: 'Crisp introductory notes followed by a musical trill',
    frequencyBandHz: '3.0 kHz – 7.8 kHz',
    iucnStatus: 'Least Concern (LC)',
    image: '/images/song-sparrow.svg',
    audioUrl: '/samples/song-sparrow.wav',
  },
  {
    id: 'demo-dove',
    commonName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    family: 'Columbidae (Pigeons and Doves)',
    habitat: 'Open country, forest edges, suburbs, agricultural fields',
    description: 'Soft, distinctive mournful coo-OO-oo-oo-oo call with characteristic whistling wingbeats.',
    vocalization: 'Gentle mournful cooing dawn chorus calls',
    frequencyBandHz: '0.4 kHz – 1.8 kHz',
    iucnStatus: 'Least Concern (LC)',
    image: '/images/mourning-dove.svg',
    audioUrl: '/samples/mourning-dove.wav',
  },
  {
    id: 'demo-owl',
    commonName: 'Barn Owl',
    scientificName: 'Tyto alba',
    family: 'Tytonidae (Barn Owls)',
    habitat: 'Grasslands, agricultural fields, woodland edges, old barns',
    description: 'Distinctive heart-shaped facial disc; delivers a harsh, raspy 2-second hissing night shriek.',
    vocalization: 'Harsh raspy hissing screech echoing across night meadows',
    frequencyBandHz: '1.5 kHz – 6.5 kHz',
    iucnStatus: 'Least Concern (LC)',
    image: '/images/barn-owl.svg',
    audioUrl: '/samples/barn-owl.wav',
  },
];

import { SAMPLE_AUDIO_LIST, SampleAudioItem } from '../data/sampleAudio';
import { BIRD_SPECIES_DATABASE } from '../data/birdDatabase';

interface SpeciesCatalogProps {
  detectedChecklist: SurveyChecklistItem[];
  locationName: string;
  isSunlightMode: boolean;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSelectSample?: (sample: SampleAudioItem) => void;
}

export const SpeciesCatalog: React.FC<SpeciesCatalogProps> = ({
  detectedChecklist,
  locationName,
  isSunlightMode,
  searchQuery,
  onSearchChange,
  onSelectSample,
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  const currentQuery = searchQuery !== undefined ? searchQuery : internalQuery;
  const updateQuery = (q: string) => {
    if (onSearchChange) onSearchChange(q);
    setInternalQuery(q);
  };

  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleTogglePlay = (id: string, audioUrl: string) => {
    if (!audioPlayerRef.current) return;

    if (playingId === id) {
      audioPlayerRef.current.pause();
      setPlayingId(null);
    } else {
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.play().catch(() => {});
      setPlayingId(id);
    }
  };

  const filteredDemoSpecies = DEMO_SPECIES_LIST.filter(
    (s) =>
      s.commonName.toLowerCase().includes(currentQuery.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(currentQuery.toLowerCase()) ||
      s.family.toLowerCase().includes(currentQuery.toLowerCase())
  );

  const additionalDbSpecies = currentQuery.trim().length > 1
    ? BIRD_SPECIES_DATABASE.filter(
        (b) =>
          !DEMO_SPECIES_LIST.some((d) => d.commonName.toLowerCase() === b.commonName.toLowerCase()) &&
          (b.commonName.toLowerCase().includes(currentQuery.toLowerCase()) ||
            b.scientificName.toLowerCase().includes(currentQuery.toLowerCase()) ||
            b.family.toLowerCase().includes(currentQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <audio
        ref={audioPlayerRef}
        onEnded={() => setPlayingId(null)}
        className="hidden"
      />

      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E0D8]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-full bg-[#D73C30]/10 text-[#D73C30]">
              <Bird className="w-5 h-5" />
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#241B12]">
              Regional Avian Checklist & Reference Taxonomy
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#736B63] mt-1 font-sans">
            Reference checklist for <strong className="text-[#241B12]">{locationName}</strong>. Includes verified local indicator examples and real-time field survey tallies.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#736B63]" />
          <input
            type="text"
            placeholder="Search species or family..."
            value={currentQuery}
            onChange={(e) => updateQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-[#E5E0D8] bg-[#F7F5F2] text-[#241B12] placeholder-[#736B63] outline-none focus:border-[#D73C30] transition-colors"
          />
        </div>
      </div>

      {/* Active Transect Detections (if any logged) */}
      {detectedChecklist.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-[#241B12] flex items-center gap-2">
              <span>Active Transect Detections</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#3D8B40]/10 text-[#3D8B40]">
                {detectedChecklist.length} Logged
              </span>
            </h3>
            <span className="text-xs text-[#736B63]">Verified on-device BirdNET observations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {detectedChecklist.map((item) => (
              <div
                key={item.speciesId}
                className="p-5 rounded-xl border border-[#E5E0D8] bg-white shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-sans font-bold text-lg text-[#241B12]">
                        {item.commonName}
                      </h4>
                      <p className="font-serif italic text-sm text-[#736B63]">
                        {item.scientificName}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#D73C30]/10 text-[#D73C30]">
                      {Math.round(item.maxConfidence * 100)}% peak
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#736B63]">
                    <MapPin className="w-3.5 h-3.5 text-[#3D8B40]" />
                    <span>{item.habitat}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#F0ECE6] flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#241B12]">{item.detectionCount} acoustic detection(s)</span>
                  <span className="text-[#3D8B40] font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Logged to Transect</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4 Demo Reference Species Cards Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#241B12] flex items-center gap-2">
              <span>Habitat Reference Examples</span>
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#D73C30]/10 text-[#D73C30] border border-[#D73C30]/20">
                4 Example Species
              </span>
            </h3>
            <p className="text-xs text-[#736B63] mt-0.5">
              Core avian indicators pre-calibrated for on-device BirdNET v2.4 classification in North American habitats.
            </p>
          </div>
        </div>

        {/* 4 Demo Species Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDemoSpecies.map((species) => {
            const isPlaying = playingId === species.id;
            return (
              <div
                key={species.id}
                className="p-5 sm:p-6 rounded-xl border border-[#E5E0D8] bg-white shadow-sm hover:shadow-md transition-all hover:border-[#D73C30]/40 flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header with Bird Photo/Illustration and Taxonomy */}
                  <div className="flex items-start gap-4">
                    {/* Proper Bird Illustration/Photo */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-[#E5E0D8] group-hover:border-[#D73C30]/60 overflow-hidden shrink-0 bg-[#F7F5F2] shadow-sm transition-transform group-hover:scale-105">
                      <img
                        src={species.image}
                        alt={species.commonName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Bold Common Name & Italic Scientific Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F7F5F2] border border-[#E5E0D8] text-[#8C6D4F]">
                          Example Species
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#3D8B40]/10 text-[#3D8B40] border border-[#3D8B40]/20">
                          {species.iucnStatus}
                        </span>
                      </div>

                      {/* BOLD COMMON NAME */}
                      <h4 className="font-serif font-bold text-xl sm:text-2xl text-[#241B12] tracking-tight leading-tight">
                        {species.commonName}
                      </h4>

                      {/* ITALIC SCIENTIFIC NAME */}
                      <p className="font-serif italic text-sm text-[#736B63] mt-0.5">
                        {species.scientificName}
                      </p>

                      <p className="text-[11px] font-sans text-[#A89B8C] mt-0.5">
                        Family: {species.family}
                      </p>
                    </div>
                  </div>

                  {/* Ecological Notes & Habitat */}
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-[#736B63]">
                      <Trees className="w-4 h-4 text-[#3D8B40] shrink-0 mt-0.5" />
                      <span><strong className="text-[#241B12] font-semibold">Habitat:</strong> {species.habitat}</span>
                    </div>

                    <div className="flex items-start gap-2 text-[#736B63]">
                      <Volume2 className="w-4 h-4 text-[#E67E22] shrink-0 mt-0.5" />
                      <span><strong className="text-[#241B12] font-semibold">Acoustic Signature:</strong> {species.vocalization}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer with Audio Call Sample Player & AI Simulation Button */}
                <div className="mt-5 pt-3 border-t border-[#F0ECE6] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-[#A89B8C]">
                    Freq: {species.frequencyBandHz}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePlay(species.id, species.audioUrl)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                        isPlaying
                          ? 'bg-[#D73C30] text-white'
                          : 'bg-[#F7F5F2] hover:bg-[#ECE7E1] text-[#241B12] border border-[#E5E0D8]'
                      }`}
                      title={`Listen to sample vocalization of ${species.commonName}`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause Audio</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 text-[#D73C30] fill-current" />
                          <span>Listen Call</span>
                        </>
                      )}
                    </button>

                    {onSelectSample && (() => {
                      const match = SAMPLE_AUDIO_LIST.find(
                        (s) => s.speciesName.toLowerCase() === species.commonName.toLowerCase()
                      );
                      if (!match) return null;
                      return (
                        <button
                          type="button"
                          onClick={() => {
                            handleTogglePlay(species.id, species.audioUrl);
                            onSelectSample(match);
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 bg-[#241B12] hover:bg-[#36291E] text-white transition-all cursor-pointer shadow-xs border border-[#4E3A2B]"
                          title={`Simulate and run BirdNET inference on ${species.commonName}`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#E67E22]" />
                          <span>Classify Call</span>
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search Results from Global Database (if searching beyond the 4 demo species) */}
        {additionalDbSpecies.length > 0 && (
          <div className="mt-8 space-y-4 pt-6 border-t border-[#E5E0D8]">
            <h4 className="font-serif font-bold text-base text-[#241B12] flex items-center gap-2">
              <span>Additional Matching Species in Database</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5E0D8] text-[#241B12]">
                {additionalDbSpecies.length} Found
              </span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {additionalDbSpecies.map((bird) => (
                <div
                  key={bird.id}
                  className="p-3.5 rounded-xl border border-[#E5E0D8] bg-[#F7F5F2] hover:bg-white transition-all"
                >
                  <div className="font-sans font-bold text-sm text-[#241B12]">{bird.commonName}</div>
                  <div className="font-serif italic text-xs text-[#736B63]">{bird.scientificName}</div>
                  <div className="text-[11px] text-[#A89B8C] mt-1">Family: {bird.family}</div>
                  <div className="text-[11px] text-[#736B63] mt-1">{bird.habitat}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
