// Music & Calming Songs Service for Elderly Cognitive Comfort & Music Therapy
// Supports HTML5 Audio, Custom File Uploads (MP3/WAV/etc.), and Web Audio API Synthesizer Fallback

import { SongTrack, CustomSongInput, SongCategory } from '../types';

// Curated nostalgic, peaceful, and therapeutic songs for seniors
export const DEFAULT_SONGS: SongTrack[] = [
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    category: 'classical',
    durationSeconds: 304,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg',
    coverImage: 'https://images.unsplash.com/photo-1520523839898-507125cd53c1?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Calm & Dreamy (1905)',
    description: 'A deeply soothing French impressionist piano masterpiece that reduces agitation and inspires gentle reflection.',
    synthesizedNotes: [
      { note: 'F5', duration: 0.8 }, { note: 'Eb5', duration: 0.8 }, { note: 'Db5', duration: 1.2 },
      { note: 'C5', duration: 0.8 }, { note: 'Bb4', duration: 1.2 }, { note: 'Ab4', duration: 1.5 },
      { note: 'F4', duration: 0.8 }, { note: 'Ab4', duration: 0.8 }, { note: 'Db5', duration: 2.0 },
    ],
  },
  {
    id: 'canon-in-d',
    title: 'Canon in D Major',
    artist: 'Johann Pachelbel',
    category: 'classical',
    durationSeconds: 375,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Peaceful & Harmonious (1680)',
    description: 'One of the most famous harmonious progressions in human history, known to lower resting heart rates and foster comfort.',
    synthesizedNotes: [
      { note: 'F#4', duration: 0.6 }, { note: 'E4', duration: 0.6 }, { note: 'D4', duration: 0.6 },
      { note: 'C#4', duration: 0.6 }, { note: 'B3', duration: 0.6 }, { note: 'A3', duration: 0.6 },
      { note: 'B3', duration: 0.6 }, { note: 'C#4', duration: 0.6 }, { note: 'D4', duration: 1.5 },
    ],
  },
  {
    id: 'moonlight-sonata',
    title: 'Moonlight Sonata (Adagio)',
    artist: 'Ludwig van Beethoven',
    category: 'classical',
    durationSeconds: 320,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Beethoven_Moonlight_1st_movement.ogg',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Gentle Piano (1801)',
    description: 'Hypnotic flowing triplets in C-sharp minor that offer grounding stillness and a serene auditory sanctuary.',
    synthesizedNotes: [
      { note: 'G#3', duration: 0.4 }, { note: 'C#4', duration: 0.4 }, { note: 'E4', duration: 0.4 },
      { note: 'G#3', duration: 0.4 }, { note: 'C#4', duration: 0.4 }, { note: 'E4', duration: 0.4 },
      { note: 'G#4', duration: 1.2 }, { note: 'F##4', duration: 0.6 }, { note: 'G#4', duration: 1.5 },
    ],
  },
  {
    id: 'brahms-lullaby',
    title: "Brahms' Wiegenlied (Lullaby)",
    artist: 'Johannes Brahms',
    category: 'nostalgia',
    durationSeconds: 154,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Brahms_Wiegenlied_Lullaby.ogg',
    coverImage: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Sweet Lullaby (1868)',
    description: 'The world-famous childhood lullaby ("Guten Abend, gut\' Nacht") sparking deep childhood familiarity and warmth.',
    synthesizedNotes: [
      { note: 'E4', duration: 0.6 }, { note: 'E4', duration: 0.6 }, { note: 'G4', duration: 1.0 },
      { note: 'E4', duration: 0.6 }, { note: 'E4', duration: 0.6 }, { note: 'G4', duration: 1.0 },
      { note: 'E4', duration: 0.4 }, { note: 'G4', duration: 0.4 }, { note: 'C5', duration: 1.0 },
      { note: 'B4', duration: 0.6 }, { note: 'A4', duration: 0.6 }, { note: 'A4', duration: 0.6 },
      { note: 'G4', duration: 1.5 },
    ],
  },
  {
    id: 'fur-elise',
    title: 'Für Elise (Bagatelle in A Minor)',
    artist: 'Ludwig van Beethoven',
    category: 'classical',
    durationSeconds: 178,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Bagatelle_No._25_in_A_minor_%28WoO_59%2C_%22F%C3%BCr_Elise%22%29_by_Ludwig_van_Beethoven.ogg',
    coverImage: 'https://images.unsplash.com/photo-1445743432342-eac500ce72b7?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Playful Nostalgia (1810)',
    description: 'Instantly recognizable piano melody that invites gentle humming and rhythm coordination.',
    synthesizedNotes: [
      { note: 'E5', duration: 0.4 }, { note: 'D#5', duration: 0.4 }, { note: 'E5', duration: 0.4 },
      { note: 'D#5', duration: 0.4 }, { note: 'E5', duration: 0.4 }, { note: 'B4', duration: 0.4 },
      { note: 'D5', duration: 0.4 }, { note: 'C5', duration: 0.4 }, { note: 'A4', duration: 1.2 },
    ],
  },
  {
    id: 'gymnopedie-1',
    title: 'Gymnopédie No. 1',
    artist: 'Erik Satie',
    category: 'ambient',
    durationSeconds: 198,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Meditative Serenity (1888)',
    description: 'Minimalist, slow-paced harmonic chords that release muscle tension and calm overstimulated thoughts.',
    synthesizedNotes: [
      { note: 'G4', duration: 1.2 }, { note: 'F#4', duration: 0.8 }, { note: 'E4', duration: 0.8 },
      { note: 'B3', duration: 1.5 }, { note: 'C4', duration: 0.8 }, { note: 'D4', duration: 0.8 },
      { note: 'E4', duration: 2.0 },
    ],
  },
  {
    id: 'vivaldi-spring',
    title: 'The Four Seasons: Spring',
    artist: 'Antonio Vivaldi',
    category: 'classical',
    durationSeconds: 215,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Vivaldi_Spring_mvt_1_Allegro_-_John_Harrison_violin.ogg',
    coverImage: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Joyful Awakening (1725)',
    description: 'Uplifting baroque violins capturing birdsong, blooming flowers, and refreshing spring breezes.',
    synthesizedNotes: [
      { note: 'E4', duration: 0.4 }, { note: 'G#4', duration: 0.4 }, { note: 'G#4', duration: 0.4 },
      { note: 'G#4', duration: 0.8 }, { note: 'F#4', duration: 0.4 }, { note: 'E4', duration: 0.8 },
      { note: 'B4', duration: 1.2 },
    ],
  },
  {
    id: 'ocean-waves-ambient',
    title: 'Peaceful Ocean Waves & Breeze',
    artist: 'Nature Soundscapes',
    category: 'nature',
    durationSeconds: 240,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Clair_de_lune_%28Claude_Debussy%29_Suite_bergamasque.ogg', // Fallback stream
    coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Deep Relaxation & Rest',
    description: 'Gentle, rolling coastal waves that naturally synchronize breathing and encourage peaceful afternoon rest.',
    synthesizedNotes: [
      { note: 'C3', duration: 2.0 }, { note: 'G3', duration: 2.5 }, { note: 'C4', duration: 3.0 },
      { note: 'E4', duration: 2.0 }, { note: 'G3', duration: 2.5 },
    ],
  },
  {
    id: 'morning-birds-forest',
    title: 'Morning Forest Birds & Soft Brook',
    artist: 'Nature Soundscapes',
    category: 'nature',
    durationSeconds: 210,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/Erik_Satie_-_Gymnop%C3%A9die_No._1.ogg',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Refreshing Morning Calm',
    description: 'Acoustic chimes and forest birds singing softly near a trickling woodland stream.',
    synthesizedNotes: [
      { note: 'C5', duration: 0.4 }, { note: 'E5', duration: 0.4 }, { note: 'G5', duration: 0.8 },
      { note: 'C6', duration: 0.4 }, { note: 'G5', duration: 0.8 }, { note: 'E5', duration: 1.2 },
    ],
  },
  {
    id: 'golden-swing-oldies',
    title: 'Sunny Afternoon Melody (1950s Style)',
    artist: 'Vintage Memory Ensemble',
    category: 'nostalgia',
    durationSeconds: 195,
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Pachelbel%27s_Canon_in_D.ogg',
    coverImage: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=500&auto=format&fit=crop&q=80',
    eraOrMood: 'Warm Golden Years (1950s)',
    description: 'Gentle swing tempo melody reminiscent of cozy radio broadcasts, dance halls, and Sunday afternoons.',
    synthesizedNotes: [
      { note: 'C4', duration: 0.5 }, { note: 'E4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
      { note: 'A4', duration: 0.5 }, { note: 'Bb4', duration: 0.5 }, { note: 'A4', duration: 0.5 },
      { note: 'G4', duration: 1.0 }, { note: 'E4', duration: 1.0 }, { note: 'C4', duration: 1.5 },
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
