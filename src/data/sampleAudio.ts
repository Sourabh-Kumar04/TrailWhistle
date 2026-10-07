export interface SampleAudioItem {
  id: string;
  speciesName: string;
  scientificName: string;
  description: string;
  url: string;
  expectedClass: string;
}

export const SAMPLE_AUDIO_LIST: SampleAudioItem[] = [
  {
    id: 'sample-robin',
    speciesName: 'American Robin',
    scientificName: 'Turdus migratorius',
    description: 'Cheery caroling dawn whistle (3s)',
    url: '/samples/american-robin.wav',
    expectedClass: 'Bird vocalization, bird call, bird song',
  },
  {
    id: 'sample-sparrow',
    speciesName: 'Song Sparrow',
    scientificName: 'Melospiza melodia',
    description: 'Crisp notes, energetic trill (3s)',
    url: '/samples/song-sparrow.wav',
    expectedClass: 'Chirp, tweet',
  },
  {
    id: 'sample-dove',
    speciesName: 'Mourning Dove',
    scientificName: 'Zenaida macroura',
    description: 'Gentle low-pitch hollow cooing (3s)',
    url: '/samples/mourning-dove.wav',
    expectedClass: 'Pigeon, dove',
  },
  {
    id: 'sample-owl',
    speciesName: 'Barn Owl',
    scientificName: 'Tyto alba',
    description: 'Raspy night hissing screech (3s)',
    url: '/samples/barn-owl.wav',
    expectedClass: 'Owl',
  },
];
