// Music & Calming Songs Service for Elderly Cognitive Comfort & Music Therapy
// Supports HTML5 Audio, Custom File Uploads (MP3/WAV/etc.), and Web Audio API Synthesizer Fallback

import { SongTrack, CustomSongInput, SongCategory } from '../types';

// Curated Bollywood Evergreen Classics, Sacred Devotionals, and North Eastern Traditional & Folk songs for seniors
export const DEFAULT_SONGS: SongTrack[] = [
  // --- USER SPECIFIED DEFAULT PERMANENT SONGS ---
  {
    id: 'deva-shree-ganesha',
    title: 'Deva Shree Ganesha (देवा श्री गणेशा)',
    artist: 'Ajay Gogavale • Ajay-Atul (Agneepath)',
    category: 'devotional',
    durationSeconds: 338,
    audioUrl: '/audio/deva-shree-ganesha.wav',
    coverImage: 'https://images.unsplash.com/photo-1567591414240-e2d4fd5fa44b?w=600&auto=format&fit=crop&q=80',
    eraOrMood: 'Devotional Power, Sacred Dhols & Inner Strength',
    description: 'Powerful and uplifting Ganesh Aarti anthem invoking divine strength, courage, and auspicious beginnings. Features thunderous traditional dhols, temple bells, and a majestic chorus that energizes the spirit.',
    youtubeId: 'RCCYorPLJmQ',
    synthesizedNotes: [
      { note: 'D4', duration: 0.5 }, { note: 'F4', duration: 0.5 }, { note: 'G4', duration: 0.5 },
      { note: 'A4', duration: 1.0 }, { note: 'Bb4', duration: 0.5 }, { note: 'A4', duration: 0.8 },
      { note: 'G4', duration: 0.8 }, { note: 'F4', duration: 0.8 }, { note: 'E4', duration: 0.5 },
      { note: 'D4', duration: 1.5 },
    ],
  },
  {
    id: 'achyutam-keshavam',
    title: 'Achyutam Keshavam (अच्युतम केशवम - कृष्ण दामोदरम)',
    artist: 'Sacred Krishna Bhajan • Devotional Stotram',
    category: 'devotional',
    durationSeconds: 344,
    audioUrl: '/audio/achyutam-keshavam.wav',
    coverImage: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=600&auto=format&fit=crop&q=80',
    eraOrMood: 'Peaceful Meditation, Soothing Temple Flute & Aarti',
    description: 'Ancient, deeply peaceful Krishna devotional hymn celebrating the sacred names of Rama, Krishna, Damodara, and Janaki Vallabha. Its gentle meditative rhythm naturally calms racing thoughts, soothes restlessness, and brings spiritual peace.',
    youtubeId: '5-Xoh7jKVo8',
    synthesizedNotes: [
      { note: 'G4', duration: 0.8 }, { note: 'C5', duration: 1.0 }, { note: 'B4', duration: 0.6 },
      { note: 'A4', duration: 0.8 }, { note: 'G4', duration: 1.4 }, { note: 'E4', duration: 0.8 },
      { note: 'F4', duration: 0.8 }, { note: 'G4', duration: 1.2 }, { note: 'C4', duration: 1.8 },
    ],
  },
  {
    id: 'shape-of-you',
    title: 'Shape of You (Come On Be My Baby)',
    artist: 'Ed Sheeran',
    category: 'pop',
    durationSeconds: 234,
    audioUrl: '/audio/shape-of-you.wav',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    eraOrMood: 'Joyful Acoustic Marimba & Rhythmic Vitality (2017)',
    description: 'World-famous upbeat acoustic pop anthem driven by an infectious wooden marimba riff, rhythmic handclaps, and playful melody. Ideal for gentle rhythmic movement, mood lifting, and bringing smiles.',
    youtubeId: 'JGwWNGJdvx8',
    synthesizedNotes: [
      { note: 'C#4', duration: 0.3 }, { note: 'E4', duration: 0.3 }, { note: 'F#4', duration: 0.3 },
      { note: 'G#4', duration: 0.4 }, { note: 'A4', duration: 0.3 }, { note: 'G#4', duration: 0.3 },
      { note: 'F#4', duration: 0.3 }, { note: 'E4', duration: 0.5 },
    ],
  },
  {
    id: 'tu-agar-meri',
    title: 'Tu Agar Meri (तू अगर मेरी - ये हवाएं तेरी)',
    artist: 'Soulful Melodic Romance • Acoustic Ballad',
    category: 'bollywood',
    durationSeconds: 362,
    audioUrl: '/audio/tu-agar-meri.wav',
    coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80',
    eraOrMood: 'Heartwarming Romance & Evening Breeze',
    description: 'Deeply emotive romantic ballad with lush legato strings, warm piano arpeggios, and poetic devotion ("Tu agar meri, ye hawayein teri..."). Envelops listeners in a tender, reassuring embrace.',
    youtubeId: 'KJk9dlP6kvM',
    synthesizedNotes: [
      { note: 'G4', duration: 0.8 }, { note: 'A4', duration: 0.8 }, { note: 'B4', duration: 1.2 },
      { note: 'D5', duration: 1.2 }, { note: 'C5', duration: 0.8 }, { note: 'B4', duration: 0.8 },
      { note: 'A4', duration: 1.5 }, { note: 'G4', duration: 2.0 },
    ],
  },
  {
    id: 'kar-porokh',
    title: 'Kar Porokh (কাৰ পৰশ - কাৰ হাহাকাৰ)',
    artist: 'Assamese Soulful Folk & Regional Melodies (Assam)',
    category: 'northeast',
    durationSeconds: 358,
    audioUrl: '/audio/kar-porokh.wav',
    coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    eraOrMood: 'Soul of Assam • Brahmaputra River Folk & Lyrical Solace',
    description: 'Timeless Assamese lyrical folk ballad exploring life’s gentle touch, perseverance, and emotional solace. Rich in traditional acoustic guitar and Assamese bamboo flute (Bahi), cherished across North Eastern families.',
    youtubeId: 'xEBEY8xb200',
    synthesizedNotes: [
      { note: 'F4', duration: 0.8 }, { note: 'A4', duration: 1.0 }, { note: 'C5', duration: 1.2 },
      { note: 'Bb4', duration: 0.7 }, { note: 'A4', duration: 0.9 }, { note: 'G4', duration: 1.2 },
      { note: 'F4', duration: 0.9 }, { note: 'D4', duration: 0.9 }, { note: 'F4', duration: 1.8 },
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
  private youtubeTimer: number | null = null;

  private customSongs: SongTrack[] = [];
  private favorites: Set<string> = new Set();
  private listeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadStoredData();
      this.initAudioElement();
      const all = this.getAllSongs();
      if (all.length > 0) {
        this.currentSong = all[0];
        this.duration = all[0].durationSeconds;
      }
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
      if (this.currentSong?.youtubeId) return;
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

  private startYoutubeTimer(): void {
    this.stopYoutubeTimer();
    this.youtubeTimer = window.setInterval(() => {
      if (this.isPlaying && this.currentSong?.youtubeId) {
        if (this.duration > 0 && this.currentTime >= this.duration) {
          if (this.isLooping) {
            this.currentTime = 0;
            this.notifyListeners();
          } else {
            this.nextSong();
          }
        } else {
          this.currentTime += 1;
          this.notifyListeners();
        }
      }
    }, 1000);
  }

  private stopYoutubeTimer(): void {
    if (this.youtubeTimer !== null) {
      clearInterval(this.youtubeTimer);
      this.youtubeTimer = null;
    }
  }

  public playSong(song: SongTrack): void {
    this.stopSynthesizer();
    this.stopYoutubeTimer();
    this.currentSong = song;
    this.currentTime = 0;
    this.duration = song.durationSeconds;
    this.isPlaying = true;
    this.isSynthesizing = false;

    // For YouTube songs: YouTube embedded player handles the official genuine audio/video stream!
    if (song.youtubeId) {
      if (this.audioElement) {
        this.audioElement.pause();
        this.audioElement.removeAttribute('src');
      }
      this.startYoutubeTimer();
      this.notifyListeners();
      return;
    }

    // For uploaded custom files: use HTML5 Audio
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
    this.stopYoutubeTimer();
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.notifyListeners();
  }

  public resume(): void {
    if (!this.currentSong) return;
    this.isPlaying = true;

    if (this.currentSong.youtubeId) {
      this.startYoutubeTimer();
      this.notifyListeners();
      return;
    }

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
