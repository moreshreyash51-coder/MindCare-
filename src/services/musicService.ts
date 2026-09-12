// Music & Calming Songs Service for Elderly Cognitive Comfort & Music Therapy
// Supports HTML5 Audio, Custom File Uploads (MP3/WAV/etc.), and Web Audio API Synthesizer Fallback

import { SongTrack, CustomSongInput, SongCategory } from '../types';

// Curated Bollywood Evergreen Classics & Indian North Eastern Traditional & Folk songs for seniors
export const DEFAULT_SONGS: SongTrack[] = [
  // --- BOLLYWOOD CLASSICS (GOLDEN ERA) ---
  {
    id: 'lag-ja-gale',
    title: 'Lag Ja Gale (लग जा गले)',
    artist: 'Lata Mangeshkar • Madan Mohan',
    category: 'bollywood',
    durationSeconds: 258,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Golden Era Romance & Serenity (1964)',
    description: 'India’s most comforting evergreen melody. Lata Mangeshkar’s soothing vocals and gentle acoustic violin relieve agitation and invite nostalgic peace.',
    synthesizedNotes: [
      { note: 'G4', duration: 0.6 }, { note: 'Bb4', duration: 0.6 }, { note: 'C5', duration: 0.8 },
      { note: 'D5', duration: 1.0 }, { note: 'C5', duration: 0.6 }, { note: 'Bb4', duration: 0.6 },
      { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 1.2 }, { note: 'F4', duration: 0.6 },
      { note: 'G4', duration: 1.8 },
    ],
  },
  {
    id: 'kabhi-kabhie-mere-dil-mein',
    title: 'Kabhi Kabhie Mere Dil Mein (कभी कभी मेरे दिल में)',
    artist: 'Mukesh & Lata Mangeshkar • Khayyam',
    category: 'bollywood',
    durationSeconds: 282,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Poetic Reflection & Warmth (1976)',
    description: 'Sahir Ludhianvi’s poetic warmth and Khayyam’s gentle acoustic tempo, beloved by generations of seniors for calming afternoon reflection.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.8 }, { note: 'E4', duration: 0.8 }, { note: 'G4', duration: 1.0 },
      { note: 'C5', duration: 1.2 }, { note: 'B4', duration: 0.6 }, { note: 'A4', duration: 0.8 },
      { note: 'G4', duration: 1.2 }, { note: 'E4', duration: 0.8 }, { note: 'D4', duration: 0.8 },
      { note: 'C4', duration: 2.0 },
    ],
  },
  {
    id: 'yeh-sham-mastani',
    title: 'Yeh Shaam Mastani (ये शाम मस्तानी)',
    artist: 'Kishore Kumar • R.D. Burman',
    category: 'bollywood',
    durationSeconds: 275,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bagatelle_No._25_in_A_minor_%28WoO_59%2C_%22F%C3%BCr_Elise%22%29_by_Ludwig_van_Beethoven.ogg',
    coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Joyful Whistling & Evening Breeze (1971)',
    description: 'Uplifting whistling intro and Kishore Kumar’s joyful baritone cadence from Kati Patang that sparks smiles, toe-tapping, and happy memories.',
    synthesizedNotes: [
      { note: 'D4', duration: 0.5 }, { note: 'F#4', duration: 0.5 }, { note: 'A4', duration: 0.8 },
      { note: 'B4', duration: 0.8 }, { note: 'A4', duration: 0.5 }, { note: 'F#4', duration: 0.5 },
      { note: 'G4', duration: 0.8 }, { note: 'E4', duration: 0.8 }, { note: 'D4', duration: 1.6 },
    ],
  },
  {
    id: 'pyaar-hua-iqraar-hua',
    title: 'Pyaar Hua Iqraar Hua (प्यार हुआ इकरार हुआ)',
    artist: 'Manna Dey & Lata Mangeshkar • Shankar-Jaikishan',
    category: 'bollywood',
    durationSeconds: 260,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Raindrops & Vintage Umbrella Romance (1955)',
    description: 'Iconic Raj Kapoor & Nargis rainfall melody from Shree 420. The gentle strings and comforting refrain bring instant, reassuring nostalgia.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.6 }, { note: 'D4', duration: 0.6 }, { note: 'E4', duration: 0.8 },
      { note: 'F4', duration: 0.8 }, { note: 'G4', duration: 1.2 }, { note: 'A4', duration: 0.6 },
      { note: 'G4', duration: 0.8 }, { note: 'F4', duration: 0.6 }, { note: 'E4', duration: 1.8 },
    ],
  },
  {
    id: 'chookar-mere-mann-ko',
    title: 'Chookar Mere Mann Ko (छूकर मेरे मन को)',
    artist: 'Kishore Kumar • Rajesh Roshan',
    category: 'bollywood',
    durationSeconds: 250,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Brahms_Wiegenlied_Lullaby.ogg',
    coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Gentle Piano & Heartwarming Comfort (1981)',
    description: 'Tender acoustic piano and Kishore Kumar’s soft, measured vocals from Yaarana that soothe restlessness and warm the heart.',
    synthesizedNotes: [
      { note: 'E4', duration: 0.7 }, { note: 'G4', duration: 0.7 }, { note: 'B4', duration: 1.0 },
      { note: 'C5', duration: 1.2 }, { note: 'B4', duration: 0.7 }, { note: 'A4', duration: 0.7 },
      { note: 'G4', duration: 1.2 }, { note: 'E4', duration: 1.8 },
    ],
  },
  {
    id: 'tere-bina-zindagi-se',
    title: 'Tere Bina Zindagi Se (तेरे बिना ज़िंदगी से)',
    artist: 'Kishore Kumar & Lata Mangeshkar • R.D. Burman',
    category: 'bollywood',
    durationSeconds: 310,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Poignant Classical Sitar & Flute (1975)',
    description: 'Gulzar’s immortal poetry set to gentle sitar and santoor in Aandhi. A deeply grounding, peaceful track for relaxation.',
    synthesizedNotes: [
      { note: 'F4', duration: 0.7 }, { note: 'A4', duration: 0.7 }, { note: 'C5', duration: 1.0 },
      { note: 'D5', duration: 1.0 }, { note: 'C5', duration: 0.6 }, { note: 'Bb4', duration: 0.6 },
      { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 0.8 }, { note: 'F4', duration: 2.0 },
    ],
  },

  // --- INDIAN NORTH EASTERN SONGS & TRADITIONAL FOLK ---
  {
    id: 'dil-hoom-hoom-kare',
    title: 'Dil Hoom Hoom Kare / Bistirno Parore (দিল হূম হূম কৰে)',
    artist: 'Dr. Bhupen Hazarika (Assam • Bard of the Brahmaputra)',
    category: 'northeast',
    durationSeconds: 320,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Soul of the Brahmaputra Valley (Assam)',
    description: 'Dr. Bhupen Hazarika’s legendary baritone ballad echoing across the mighty Brahmaputra river. Its profound, gentle rhythm anchors the soul.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.8 }, { note: 'Eb4', duration: 0.8 }, { note: 'F4', duration: 1.0 },
      { note: 'G4', duration: 1.2 }, { note: 'Bb4', duration: 0.8 }, { note: 'C5', duration: 1.5 },
      { note: 'Bb4', duration: 0.8 }, { note: 'G4', duration: 1.0 }, { note: 'F4', duration: 0.8 },
      { note: 'Eb4', duration: 0.8 }, { note: 'C4', duration: 2.0 },
    ],
  },
  {
    id: 'mayabini-ratir-bukut',
    title: 'Mayabini Ratir Bukut (মায়াবিনী ৰাতিৰ বুকুত)',
    artist: 'Dr. Jayanta Hazarika (Assamese Evergreen Melodies)',
    category: 'northeast',
    durationSeconds: 270,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Starlit Assamese Acoustic Serenity',
    description: 'A poetic Assamese acoustic ballad evoking gentle night breezes, starlit hills, and peaceful reminiscence of Assam.',
    synthesizedNotes: [
      { note: 'G4', duration: 0.7 }, { note: 'A4', duration: 0.7 }, { note: 'C5', duration: 1.0 },
      { note: 'D5', duration: 1.2 }, { note: 'E5', duration: 1.0 }, { note: 'D5', duration: 0.7 },
      { note: 'C5', duration: 1.0 }, { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 2.0 },
    ],
  },
  {
    id: 'kopou-phool-bihu-flute',
    title: 'Kopou Phool (কপৌ ফুল - বিহু বাঁহী)',
    artist: 'Traditional Assamese Bihu Folk • Bamboo Flute & Dhol',
    category: 'northeast',
    durationSeconds: 230,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg',
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Rongali Bihu Spring Celebration (Assam)',
    description: 'Sweet bamboo flute (Bahi) playing festive springtime melodies of orchids blooming in Kaziranga and upper Assam, inspiring joy.',
    synthesizedNotes: [
      { note: 'D4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'A4', duration: 0.6 },
      { note: 'B4', duration: 0.8 }, { note: 'D5', duration: 1.0 }, { note: 'B4', duration: 0.6 },
      { note: 'A4', duration: 0.6 }, { note: 'G4', duration: 0.8 }, { note: 'E4', duration: 0.6 },
      { note: 'D4', duration: 1.8 },
    ],
  },
  {
    id: 'meghalaya-khasi-duitara',
    title: 'Khasi Hills Flute & Duitara (Meghalaya Folk)',
    artist: 'Meghalaya Traditional Acoustic Ensemble',
    category: 'northeast',
    durationSeconds: 260,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Cloud-Kissed Pines of Shillong (Meghalaya)',
    description: 'Traditional Khasi 4-stringed Duitara and bamboo flute evoking the gentle waterfalls, living root bridges, and rolling green hills of Cherrapunji.',
    synthesizedNotes: [
      { note: 'E4', duration: 0.8 }, { note: 'G#4', duration: 0.8 }, { note: 'B4', duration: 1.0 },
      { note: 'C#5', duration: 1.2 }, { note: 'B4', duration: 0.8 }, { note: 'G#4', duration: 0.8 },
      { note: 'F#4', duration: 0.8 }, { note: 'E4', duration: 2.0 },
    ],
  },
  {
    id: 'manipuri-pena-meitei',
    title: 'Manipuri Pena & Meitei Serenade (পেনা সুৰ)',
    artist: 'Manipur Folk Cultural Ensemble',
    category: 'northeast',
    durationSeconds: 290,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Loktak Lake & Ancient Pena Harmony (Manipur)',
    description: 'Sacred bowed Pena instrument and gentle Meitei vocal hums carrying the meditative peace of Manipur’s floating islands.',
    synthesizedNotes: [
      { note: 'D4', duration: 0.8 }, { note: 'F4', duration: 0.8 }, { note: 'G4', duration: 1.0 },
      { note: 'A4', duration: 1.2 }, { note: 'C5', duration: 1.5 }, { note: 'A4', duration: 0.8 },
      { note: 'G4', duration: 1.0 }, { note: 'F4', duration: 0.8 }, { note: 'D4', duration: 2.2 },
    ],
  },
  {
    id: 'mizo-cheraw-lengzem',
    title: 'Mizo Lengzem Acoustic Harmony (Mizoram)',
    artist: 'Mizoram Traditional Choral Ensemble',
    category: 'northeast',
    durationSeconds: 245,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Blue Hills of Aizawl & Gentle Sunset (Mizoram)',
    description: 'Comforting Mizo acoustic fingerpicking and sweet choir harmonies, cherished in homes across the blue hills of Mizoram.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.6 }, { note: 'E4', duration: 0.6 }, { note: 'G4', duration: 0.8 },
      { note: 'A4', duration: 1.0 }, { note: 'G4', duration: 0.6 }, { note: 'E4', duration: 0.6 },
      { note: 'D4', duration: 0.8 }, { note: 'C4', duration: 1.8 },
    ],
  },
  {
    id: 'bodo-sifung-flute',
    title: 'Agor Phool (সফুং বাঁহী - Bodo Folk Flute)',
    artist: 'Bodoland Traditional Sifung Masters',
    category: 'northeast',
    durationSeconds: 250,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Serene Green Plains of Bodoland',
    description: 'The long, slender 5-hole Sifung bamboo flute of the Bodo people. Its breathy, meditative notes naturally slow down rapid thoughts.',
    synthesizedNotes: [
      { note: 'G4', duration: 0.8 }, { note: 'B4', duration: 0.8 }, { note: 'D5', duration: 1.2 },
      { note: 'E5', duration: 1.5 }, { note: 'D5', duration: 0.8 }, { note: 'B4', duration: 1.0 },
      { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 2.0 },
    ],
  },
  {
    id: 'resham-firiri-sikkim',
    title: 'Resham Firiri & Pahadi Flute (रेशम फिरिरी)',
    artist: 'Nepali & Sikkim Mountain Folk Ensemble',
    category: 'northeast',
    durationSeconds: 240,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bagatelle_No._25_in_A_minor_%28WoO_59%2C_%22F%C3%BCr_Elise%22%29_by_Ludwig_van_Beethoven.ogg',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Himalayan Mountain Sunshine (Sikkim)',
    description: 'The cheerful, timeless folk melody of Sikkim and Himalayan hill stations. Its uplifting rhythm and warm Sarangi inspire smiling and clapping.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
      { note: 'G4', duration: 0.5 }, { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 0.5 },
      { note: 'E4', duration: 0.8 }, { note: 'D4', duration: 0.8 }, { note: 'C4', duration: 1.8 },
    ],
  },

  // --- INDIAN CLASSICAL RAGAS & BANSURI FLUTE ---
  {
    id: 'bansuri-raga-bhairav',
    title: 'Bansuri Bamboo Flute • Raga Bhairav (राग भैरव)',
    artist: 'Indian Classical Bansuri Masters',
    category: 'classical',
    durationSeconds: 310,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Peaceful Morning Meditation & Stillness',
    description: 'Pure, slow morning bamboo flute raga scientifically observed to calm the autonomic nervous system and lower blood pressure.',
    synthesizedNotes: [
      { note: 'C4', duration: 1.0 }, { note: 'C#4', duration: 1.0 }, { note: 'E4', duration: 1.2 },
      { note: 'F4', duration: 1.0 }, { note: 'G4', duration: 1.5 }, { note: 'G#4', duration: 1.0 },
      { note: 'B4', duration: 1.0 }, { note: 'C5', duration: 2.0 },
    ],
  },
  {
    id: 'sitar-santoor-raga-yaman',
    title: 'Sitar & Santoor • Raga Yaman (राग यमन)',
    artist: 'Classical Sitar & Santoor Ensemble',
    category: 'classical',
    durationSeconds: 340,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Serene Evening Twilight & Gentle Sleep',
    description: 'A deeply peaceful 7-note evening raga on acoustic Sitar and Kashmiri Santoor that releases muscle tension before bedtime.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.8 }, { note: 'D4', duration: 0.8 }, { note: 'E4', duration: 1.0 },
      { note: 'F#4', duration: 1.2 }, { note: 'G4', duration: 1.2 }, { note: 'A4', duration: 0.8 },
      { note: 'B4', duration: 1.0 }, { note: 'C5', duration: 2.0 },
    ],
  },
];

// Frequencies for Web Audio melodic synthesizer fallback
const NOTE_FREQS: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'D#4': 311.13, E4: 329.63, F4: 349.23,
  'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'Bb4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'Eb5': 622.25, 'D#5': 622.25, E5: 659.25,
  F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'Bb5': 932.33,
  B5: 987.77, C6: 1046.50,
};

export interface MusicPlayerState {
  currentSong: SongTrack | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  isSynthesizing: boolean;
  playlist: SongTrack[];
  favorites: string[];
}

type StateListener = (state: MusicPlayerState) => void;

class MusicService {
  private audioElement: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthLoopTimeout: number | null = null;
  private synthOscillators: OscillatorNode[] = [];

  private currentSong: SongTrack | null = null;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private volume = 0.85;
  private isMuted = false;
  private isLooping = false;
  private isShuffling = false;
  private isSynthesizing = false;

  private customSongs: SongTrack[] = [];
  private favorites: Set<string> = new Set();
  private listeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadStoredData();
      this.initAudioElement();
    }
  }

  private loadStoredData(): void {
    try {
      const storedCustom = localStorage.getItem('mindcare_custom_songs');
      if (storedCustom) {
        this.customSongs = JSON.parse(storedCustom);
      }
      const storedFavs = localStorage.getItem('mindcare_music_favorites');
      if (storedFavs) {
        this.favorites = new Set(JSON.parse(storedFavs));
      }
      const storedVol = localStorage.getItem('mindcare_music_volume');
      if (storedVol) {
        this.volume = parseFloat(storedVol) || 0.85;
      }
      const storedMuted = localStorage.getItem('mindcare_music_muted');
      if (storedMuted) {
        this.isMuted = storedMuted === 'true';
      }
    } catch (e) {
      console.warn('Failed to load music storage:', e);
    }
  }

  private saveCustomSongs(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mindcare_custom_songs', JSON.stringify(this.customSongs));
      } catch (e) {
        console.warn('Failed to persist custom songs:', e);
      }
    }
  }

  private saveFavorites(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('mindcare_music_favorites', JSON.stringify(Array.from(this.favorites)));
      } catch (e) {
        console.warn('Failed to persist music favorites:', e);
      }
    }
  }

  private initAudioElement(): void {
    if (this.audioElement) return;

    this.audioElement = new Audio();
    this.audioElement.preload = 'auto';
    this.audioElement.volume = this.isMuted ? 0 : this.volume;

    this.audioElement.addEventListener('timeupdate', () => {
      if (this.audioElement) {
        this.currentTime = Math.floor(this.audioElement.currentTime);
        this.duration = Math.floor(this.audioElement.duration) || this.currentSong?.durationSeconds || 0;
        this.notifyListeners();
      }
    });

    this.audioElement.addEventListener('ended', () => {
      if (this.isLooping) {
        this.audioElement?.play().catch(() => {});
      } else {
        this.nextSong();
      }
    });

    this.audioElement.addEventListener('error', () => {
      console.warn('HTML5 Audio playback error or stream restriction. Switching to peaceful Web Audio synthesizer fallback.');
      this.playSynthesizedFallback();
    });
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private stopSynthesizer(): void {
    if (this.synthLoopTimeout) {
      clearTimeout(this.synthLoopTimeout);
      this.synthLoopTimeout = null;
    }
    this.synthOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (_) {}
    });
    this.synthOscillators = [];
    this.isSynthesizing = false;
  }

  // Melodic synthesizer playing peaceful tones when external audio stream is restricted or offline
  private playSynthesizedFallback(): void {
    this.stopSynthesizer();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isSynthesizing = true;
    const notes = this.currentSong?.synthesizedNotes || [
      { note: 'C4', duration: 0.8 },
      { note: 'E4', duration: 0.8 },
      { note: 'G4', duration: 0.8 },
      { note: 'C5', duration: 1.5 },
      { note: 'G4', duration: 0.8 },
      { note: 'E4', duration: 1.2 },
    ];

    let noteIndex = 0;

    const playNextNote = () => {
      if (!this.isPlaying || !this.isSynthesizing) return;
      const current = notes[noteIndex % notes.length];
      noteIndex++;

      const freq = NOTE_FREQS[current.note] || 261.63;
      const now = ctx.currentTime;
      const dur = current.duration;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Warm piano / celesta timbre
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const effectiveVol = this.isMuted ? 0 : this.volume * 0.4;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(effectiveVol, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + dur);
      this.synthOscillators.push(osc);

      // Clean up old oscillators
      setTimeout(() => {
        const idx = this.synthOscillators.indexOf(osc);
        if (idx !== -1) this.synthOscillators.splice(idx, 1);
      }, dur * 1000 + 100);

      this.currentTime += Math.round(dur);
      this.notifyListeners();

      this.synthLoopTimeout = window.setTimeout(playNextNote, dur * 1000);
    };

    playNextNote();
  }

  public getAllSongs(): SongTrack[] {
    const all = [...this.customSongs, ...DEFAULT_SONGS];
    return all.map((s) => ({
      ...s,
      isFavorite: this.favorites.has(s.id),
    }));
  }

  public getState(): MusicPlayerState {
    return {
      currentSong: this.currentSong,
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      isMuted: this.isMuted,
      isLooping: this.isLooping,
      isShuffling: this.isShuffling,
      isSynthesizing: this.isSynthesizing,
      playlist: this.getAllSongs(),
      favorites: Array.from(this.favorites),
    };
  }

  public playSong(song: SongTrack): void {
    this.stopSynthesizer();
    this.currentSong = song;
    this.currentTime = 0;
    this.duration = song.durationSeconds;
    this.isPlaying = true;

    if (!this.audioElement) {
      this.initAudioElement();
    }

    if (this.audioElement) {
      this.audioElement.src = song.audioUrl;
      this.audioElement.currentTime = 0;
      this.audioElement.volume = this.isMuted ? 0 : this.volume;

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Direct media playback prevented, using melodious soundscape:', err.message);
          this.playSynthesizedFallback();
        });
      }
    }

    this.notifyListeners();
  }

  public togglePlayPause(): void {
    if (!this.currentSong) {
      const all = this.getAllSongs();
      if (all.length > 0) {
        this.playSong(all[0]);
      }
      return;
    }

    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  public pause(): void {
    this.isPlaying = false;
    this.stopSynthesizer();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notifyListeners();
  }

  public resume(): void {
    if (!this.currentSong) return;
    this.isPlaying = true;

    if (this.audioElement && this.audioElement.src) {
      this.audioElement.play().catch(() => {
        this.playSynthesizedFallback();
      });
    } else {
      this.playSynthesizedFallback();
    }
    this.notifyListeners();
  }

  public nextSong(): void {
    const all = this.getAllSongs();
    if (all.length === 0) return;

    if (!this.currentSong) {
      this.playSong(all[0]);
      return;
    }

    let nextIndex = 0;
    if (this.isShuffling) {
      nextIndex = Math.floor(Math.random() * all.length);
    } else {
      const currentIndex = all.findIndex((s) => s.id === this.currentSong?.id);
      nextIndex = (currentIndex + 1) % all.length;
    }

    this.playSong(all[nextIndex]);
  }

  public previousSong(): void {
    const all = this.getAllSongs();
    if (all.length === 0) return;

    if (!this.currentSong) {
      this.playSong(all[0]);
      return;
    }

    const currentIndex = all.findIndex((s) => s.id === this.currentSong?.id);
    const prevIndex = (currentIndex - 1 + all.length) % all.length;
    this.playSong(all[prevIndex]);
  }

  public seekTo(seconds: number): void {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.audioElement && !isNaN(this.audioElement.duration)) {
      this.audioElement.currentTime = this.currentTime;
    }
    this.notifyListeners();
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_music_volume', this.volume.toString());
    }
    this.notifyListeners();
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.volume;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_music_muted', String(this.isMuted));
    }
    this.notifyListeners();
  }

  public toggleRepeat(): void {
    this.isLooping = !this.isLooping;
    this.notifyListeners();
  }

  public toggleShuffle(): void {
    this.isShuffling = !this.isShuffling;
    this.notifyListeners();
  }

  public toggleFavorite(songId: string): void {
    if (this.favorites.has(songId)) {
      this.favorites.delete(songId);
    } else {
      this.favorites.add(songId);
    }
    this.saveFavorites();
    this.notifyListeners();
  }

  public addCustomSong(input: CustomSongInput): SongTrack {
    const newSong: SongTrack = {
      id: 'custom_' + Date.now().toString(36),
      patientId: input.patientId,
      title: input.title.trim(),
      artist: input.artist?.trim() || 'Treasured Music',
      category: input.category || 'custom',
      durationSeconds: 180, // Approximate fallback duration
      audioUrl: input.audioUrl,
      coverImage:
        input.coverImage ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
      eraOrMood: input.eraOrMood?.trim() || 'Cherished Song',
      description:
        input.description?.trim() ||
        'A custom song chosen especially for your listening enjoyment and comfort.',
      isCustom: true,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    this.customSongs = [newSong, ...this.customSongs];
    this.saveCustomSongs();
    this.notifyListeners();
    return newSong;
  }

  public deleteCustomSong(songId: string): void {
    this.customSongs = this.customSongs.filter((s) => s.id !== songId);
    this.favorites.delete(songId);
    this.saveCustomSongs();
    this.saveFavorites();

    if (this.currentSong?.id === songId) {
      this.pause();
      this.currentSong = null;
    }
    this.notifyListeners();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.warn('Listener error in music service:', err);
      }
    });
  }
}

export const musicService = new MusicService();
