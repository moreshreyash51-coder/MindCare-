// Audio synthesis engine for default melodic reminder song and accessibility sound cues
// Uses the Web Audio API to play gentle, senior-friendly bells and melodies without external audio dependencies.

class ReminderAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private isLooping = false;
  private timeouts: number[] = [];
  private activeOscillators: OscillatorNode[] = [];
  private listeners: Set<(playing: boolean) => void> = new Set();

  private volume = 0.8;
  private muted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMuted = localStorage.getItem('mindcare_audio_muted');
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }
      const savedVol = localStorage.getItem('mindcare_audio_volume');
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_audio_volume', this.volume.toString());
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean): void {
    this.muted = mute;
    if (typeof window !== 'undefined') {
      localStorage.setItem('mindcare_audio_muted', mute.toString());
    }
    if (mute && this.isPlaying) {
      this.stop();
    }
  }

  public subscribe(listener: (playing: boolean) => void): () => void {
    this.listeners.add(listener);
    listener(this.isPlaying);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.isPlaying));
  }

  public isSongPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Plays a single soothing bell/music-box chime tone
   */
  private playBellTone(freq: number, startTime: number, duration: number, noteVolume = 0.22) {
    const ctx = this.getAudioContext();
    if (!ctx || this.muted) return;

    const actualVol = noteVolume * this.volume;
    if (actualVol <= 0.001) return;

    // Primary fundamental oscillator (warm sine)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Harmonic overtone oscillator (triangle wave for chime resonance)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, startTime);

    // Gain envelope with gentle attack and long, calming acoustic decay
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(actualVol, startTime + 0.025);
    gainNode.gain.exponentialRampToValueAtTime(actualVol * 0.45, startTime + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    // Subtle low-pass filter to ensure gentle, non-piercing high frequencies for senior ears
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, startTime);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(filter);
    filter.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration);
    osc2.stop(startTime + duration);

    this.activeOscillators.push(osc1, osc2);
  }

  /**
   * Plays the full calming Default Reminder Song:
   * A gentle, cheerful, reassuring lullaby/morning melody composed specifically
   * to catch seniors' attention comfortably without any jarring alarm sounds.
   */
  public playDefaultReminderSong(loop = false): void {
    this.playTune('morning-bells', loop);
  }

  /**
   * Play any of the available rich reminder songs by tuneId
   */
  public playTune(tuneId = 'morning-bells', loop = false): void {
    if (this.muted) return;
    this.stop();

    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.isPlaying = true;
    this.isLooping = loop;
    this.notify();

    let notes: Array<{ freq: number; dur: number; gap: number }> = [];

    switch (tuneId) {
      case 'calm-forest':
        // Pentatonic peaceful forest melody: D4, F#4, A4, B4, D5, B4, A4, F#4, E4, D4
        notes = [
          { freq: 293.66, dur: 0.45, gap: 0.48 }, // D4
          { freq: 369.99, dur: 0.45, gap: 0.48 }, // F#4
          { freq: 440.00, dur: 0.65, gap: 0.70 }, // A4
          { freq: 493.88, dur: 0.45, gap: 0.48 }, // B4
          { freq: 587.33, dur: 0.85, gap: 0.90 }, // D5
          { freq: 493.88, dur: 0.45, gap: 0.48 }, // B4
          { freq: 440.00, dur: 0.55, gap: 0.60 }, // A4
          { freq: 369.99, dur: 0.45, gap: 0.48 }, // F#4
          { freq: 329.63, dur: 0.55, gap: 0.60 }, // E4
          { freq: 293.66, dur: 1.40, gap: 1.50 }, // D4
        ];
        break;

      case 'sunshine-tune':
        // Cheerful uplifting G-major sunshine melody: G4, B4, D5, E5, D5, B4, G4, A4, B4, G4
        notes = [
          { freq: 392.00, dur: 0.35, gap: 0.38 }, // G4
          { freq: 493.88, dur: 0.35, gap: 0.38 }, // B4
          { freq: 587.33, dur: 0.55, gap: 0.60 }, // D5
          { freq: 659.25, dur: 0.65, gap: 0.70 }, // E5
          { freq: 587.33, dur: 0.40, gap: 0.42 }, // D5
          { freq: 493.88, dur: 0.40, gap: 0.42 }, // B4
          { freq: 392.00, dur: 0.55, gap: 0.60 }, // G4
          { freq: 440.00, dur: 0.35, gap: 0.38 }, // A4
          { freq: 493.88, dur: 0.45, gap: 0.50 }, // B4
          { freq: 392.00, dur: 1.30, gap: 1.40 }, // G4
        ];
        break;

      case 'temple-chimes':
        // Deep meditative singing chimes: Low D3, A3, D4, F#4, A4, high D5 with long resonance
        notes = [
          { freq: 146.83, dur: 1.80, gap: 0.80 }, // D3 deep bell
          { freq: 220.00, dur: 1.60, gap: 0.70 }, // A3
          { freq: 293.66, dur: 1.50, gap: 0.70 }, // D4
          { freq: 369.99, dur: 1.40, gap: 0.70 }, // F#4
          { freq: 440.00, dur: 1.60, gap: 0.80 }, // A4
          { freq: 587.33, dur: 2.20, gap: 1.80 }, // D5 bell chime
        ];
        break;

      case 'gentle-harmony':
        // Warm classical afternoon harmony: C4, E4, G4, A4, G4, F4, E4, D4, C4
        notes = [
          { freq: 261.63, dur: 0.40, gap: 0.44 }, // C4
          { freq: 329.63, dur: 0.40, gap: 0.44 }, // E4
          { freq: 392.00, dur: 0.60, gap: 0.65 }, // G4
          { freq: 440.00, dur: 0.50, gap: 0.55 }, // A4
          { freq: 392.00, dur: 0.45, gap: 0.50 }, // G4
          { freq: 349.23, dur: 0.45, gap: 0.50 }, // F4
          { freq: 329.63, dur: 0.45, gap: 0.50 }, // E4
          { freq: 293.66, dur: 0.55, gap: 0.60 }, // D4
          { freq: 261.63, dur: 1.35, gap: 1.45 }, // C4
        ];
        break;

      case 'morning-bells':
      default:
        // Warm reassuring morning lullaby
        notes = [
          { freq: 329.63, dur: 0.38, gap: 0.42 }, // E4
          { freq: 392.00, dur: 0.38, gap: 0.42 }, // G4
          { freq: 523.25, dur: 0.65, gap: 0.70 }, // C5
          { freq: 493.88, dur: 0.38, gap: 0.42 }, // B4
          { freq: 440.00, dur: 0.38, gap: 0.42 }, // A4
          { freq: 392.00, dur: 0.68, gap: 0.75 }, // G4
          { freq: 329.63, dur: 0.38, gap: 0.42 }, // E4
          { freq: 349.23, dur: 0.38, gap: 0.42 }, // F4
          { freq: 392.00, dur: 0.55, gap: 0.60 }, // G4
          { freq: 329.63, dur: 0.38, gap: 0.42 }, // E4
          { freq: 293.66, dur: 0.45, gap: 0.50 }, // D4
          { freq: 261.63, dur: 1.20, gap: 1.30 }, // C4
        ];
        break;
    }

    let startOffset = ctx.currentTime + 0.05;
    notes.forEach((n) => {
      this.playBellTone(n.freq, startOffset, n.dur, 0.24);
      startOffset += n.gap;
    });

    const totalDurationMs = (startOffset - ctx.currentTime + 0.2) * 1000;

    const timeout = window.setTimeout(() => {
      if (this.isLooping && this.isPlaying) {
        this.playTune(tuneId, true);
      } else {
        this.isPlaying = false;
        this.notify();
      }
    }, totalDurationMs);

    this.timeouts.push(timeout);
  }

  /**
   * Preview a short 2.5s snippet of any song
   */
  public previewTune(tuneId: string): void {
    this.playTune(tuneId, false);
    const stopTimeout = window.setTimeout(() => {
      if (!this.isLooping) {
        this.stop();
      }
    }, 3800);
    this.timeouts.push(stopTimeout);
  }

  /**
   * Stop the active reminder song immediately
   */
  public stop(): void {
    this.timeouts.forEach((t) => clearTimeout(t));
    this.timeouts = [];

    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Already stopped
      }
    });
    this.activeOscillators = [];

    this.isLooping = false;
    if (this.isPlaying) {
      this.isPlaying = false;
      this.notify();
    }
  }

  /**
   * Short 3-note celebration chime (e.g. when checking off a task or saving)
   */
  public playGentleChime(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime + 0.03;
    this.playBellTone(523.25, t, 0.3, 0.18); // C5
    this.playBellTone(659.25, t + 0.12, 0.35, 0.20); // E5
    this.playBellTone(783.99, t + 0.24, 0.65, 0.22); // G5
  }

  /**
   * Soft 2-note snooze tone
   */
  public playSnoozeTone(): void {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime + 0.03;
    this.playBellTone(440.00, t, 0.35, 0.16); // A4
    this.playBellTone(329.63, t + 0.2, 0.5, 0.18); // E4
  }
}

export const reminderAudio = new ReminderAudioEngine();
