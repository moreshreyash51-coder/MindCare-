const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 22050; // 22.05 kHz for compact size and good musical fidelity
const NUM_CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function createWavFile(filename, durationSec, noteGenerator) {
  const totalSamples = Math.floor(SAMPLE_RATE * durationSec);
  const dataByteLength = totalSamples * NUM_CHANNELS * (BITS_PER_SAMPLE / 8);

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLength, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(NUM_CHANNELS, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 28);
  header.writeUInt16LE(NUM_CHANNELS * (BITS_PER_SAMPLE / 8), 32);
  header.writeUInt16LE(BITS_PER_SAMPLE, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataByteLength, 40);

  const data = Buffer.alloc(dataByteLength);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    const sample = Math.max(-1, Math.min(1, noteGenerator(t, i, durationSec)));
    const intVal = Math.floor(sample * 32767);
    data.writeInt16LE(intVal, i * 2);
  }

  const outPath = path.join(__dirname, '..', 'public', 'audio', filename);
  fs.writeFileSync(outPath, Buffer.concat([header, data]));
  console.log(`Generated: ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
}

// Frequency map
const F = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, 'C#4': 277.18, D4: 293.66, 'Eb4': 311.13, E4: 329.63, F4: 349.23,
  'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'Bb4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'Eb5': 622.25, E5: 659.25, F5: 698.46,
  'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'Bb5': 932.33, B5: 987.77,
  C6: 1046.50
};

// --- 1. DEVA SHREE GANESHA (Devotional Power, Dhols, Bells, Chorus Anthem) ---
createWavFile('deva-shree-ganesha.wav', 42, (t) => {
  // Tempo 116 BPM => 1 beat = 0.517s
  const beat = 0.517;
  const measure = beat * 4;

  // Melody sequence: D4 -> F4 -> G4 -> A4 -> A4 -> G4 -> F4 -> E4 -> D4 (Deva Shree Ganesha)
  const melNotes = [
    { f: F.D4, d: beat * 0.75 }, { f: F.F4, d: beat * 0.75 }, { f: F.G4, d: beat * 0.5 },
    { f: F.A4, d: beat * 1.5 }, { f: F.A4, d: beat * 0.5 }, { f: F.Bb4, d: beat * 0.5 },
    { f: F.A4, d: beat * 1.0 }, { f: F.G4, d: beat * 1.0 }, { f: F.F4, d: beat * 1.0 },
    { f: F.E4, d: beat * 0.5 }, { f: F.D4, d: beat * 2.0 },
    // "Jwala si jalti hai..."
    { f: F.D4, d: beat }, { f: F.F4, d: beat }, { f: F.A4, d: beat }, { f: F.C5, d: beat },
    { f: F.D5, d: beat * 1.5 }, { f: F.C5, d: beat * 0.5 }, { f: F.Bb4, d: beat }, { f: F.A4, d: beat * 2 }
  ];

  const totalMelDuration = melNotes.reduce((acc, n) => acc + n.d, 0);
  const loopT = t % totalMelDuration;

  let curTime = 0;
  let activeNote = melNotes[0];
  let noteT = 0;
  for (const n of melNotes) {
    if (loopT >= curTime && loopT < curTime + n.d) {
      activeNote = n;
      noteT = loopT - curTime;
      break;
    }
    curTime += n.d;
  }

  // Melody synth (Warm Shehnai / Flute harmonic with brass vibrato)
  const env = Math.exp(-noteT * 1.8) * (1 - Math.exp(-noteT * 30));
  const vibrato = 1 + 0.015 * Math.sin(2 * Math.PI * 5.5 * t);
  const freq = activeNote.f * vibrato;
  const melody = (
    Math.sin(2 * Math.PI * freq * t) * 0.4 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.15 +
    Math.sin(2 * Math.PI * freq * 4 * t) * 0.08
  ) * env;

  // Dhol beat (Percussive low pulse on every beat, energetic offbeats)
  const beatT = (t % beat) / beat;
  const dhol = Math.sin(2 * Math.PI * 60 * Math.exp(-beatT * 8) * t) * Math.exp(-beatT * 7) * 0.45;

  // Temple Aarti Bell chimes every 2 beats
  const bellT = (t % (beat * 2)) / (beat * 2);
  const bell = (
    Math.sin(2 * Math.PI * 1800 * t) * 0.15 +
    Math.sin(2 * Math.PI * 2750 * t) * 0.1
  ) * Math.exp(-bellT * 8);

  // Tanpura / Brass Bass drone in D (73.4 Hz)
  const bass = (Math.sin(2 * Math.PI * 73.4 * t) + 0.3 * Math.sin(2 * Math.PI * 146.8 * t)) * 0.25;

  return (melody * 0.45 + dhol * 0.35 + bell * 0.1 + bass * 0.2) * 0.85;
});

// --- 2. ACHYUTAM KESHAVAM (Peaceful Krishna Bhajan, Flute, Bells, Sacred Peace) ---
createWavFile('achyutam-keshavam.wav', 44, (t) => {
  // Tempo 74 BPM => 1 beat = 0.81s
  const beat = 0.81;

  // "Achyutam Keshavam Krishna Damodaram, Rama Narayanam Janaki Vallabham"
  // Notes in C Major / Pentatonic: G4 -> C5 -> B4 -> A4 -> G4 -> E4 -> F4 -> G4 -> A4 -> G4 -> F4 -> E4 -> D4 -> C4
  const bhajanNotes = [
    { f: F.G4, d: beat * 0.8 }, { f: F.C5, d: beat * 1.2 }, { f: F.B4, d: beat * 0.6 },
    { f: F.A4, d: beat * 0.8 }, { f: F.G4, d: beat * 1.6 },
    { f: F.E4, d: beat * 0.8 }, { f: F.F4, d: beat * 0.8 }, { f: F.G4, d: beat * 1.2 },
    { f: F.A4, d: beat * 0.8 }, { f: F.G4, d: beat * 1.6 },
    // "Rama Narayanam..."
    { f: F.C5, d: beat * 1.0 }, { f: F.D5, d: beat * 1.0 }, { f: F.E5, d: beat * 1.2 },
    { f: F.D5, d: beat * 0.8 }, { f: F.C5, d: beat * 1.8 },
    { f: F.B4, d: beat * 0.8 }, { f: F.A4, d: beat * 0.8 }, { f: F.G4, d: beat * 1.0 },
    { f: F.F4, d: beat * 0.8 }, { f: F.E4, d: beat * 1.0 }, { f: F.D4, d: beat * 1.0 },
    { f: F.C4, d: beat * 2.4 }
  ];

  const totalMelDuration = bhajanNotes.reduce((acc, n) => acc + n.d, 0);
  const loopT = t % totalMelDuration;

  let curTime = 0;
  let activeNote = bhajanNotes[0];
  let noteT = 0;
  for (const n of bhajanNotes) {
    if (loopT >= curTime && loopT < curTime + n.d) {
      activeNote = n;
      noteT = loopT - curTime;
      break;
    }
    curTime += n.d;
  }

  // Soft Indian Bansuri Bamboo Flute (Breath, rich odd harmonics, gentle vibrato)
  const vib = 1 + 0.008 * Math.sin(2 * Math.PI * 4.8 * t);
  const freq = activeNote.f * vib;
  const fluteEnv = Math.min(noteT * 5, 1) * Math.exp(-noteT * 0.4);
  const flute = (
    Math.sin(2 * Math.PI * freq * t) * 0.5 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.2 +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 +
    Math.sin(2 * Math.PI * freq * 4 * t) * 0.05
  ) * fluteEnv;

  // Gentle Tanpura Drone in C & G (130.8 Hz & 196 Hz)
  const tanpura = (
    Math.sin(2 * Math.PI * 130.81 * t) * 0.15 +
    Math.sin(2 * Math.PI * 196.00 * t) * 0.12 +
    Math.sin(2 * Math.PI * 261.63 * t) * 0.08
  );

  // Soft Manjira (Indian finger cymbals / sweet bells) on every beat
  const bellT = (t % beat) / beat;
  const bell = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-bellT * 9) * 0.08;

  // Gentle Santoor / Acoustic Harp string shimmer
  const harpT = (t % (beat * 0.5)) / (beat * 0.5);
  const harp = Math.sin(2 * Math.PI * F.C5 * 2 * t) * Math.exp(-harpT * 12) * 0.05;

  return (flute * 0.55 + tanpura * 0.25 + bell * 0.1 + harp * 0.1) * 0.9;
});

// --- 3. SHAPE OF YOU (Marimba Intro Riff, Rhythmic Bounce, Uplifting Modern Beat) ---
createWavFile('shape-of-you.wav', 38, (t) => {
  // Tempo 96 BPM => 1 beat = 0.625s
  const beat = 0.625;
  const sixteenth = beat / 4;

  // Famous Marimba Riff: C#4, E4, F#4, G#4, A4, G#4, F#4, E4, C#4
  const marimbaPattern = [
    { f: F['C#4'], d: sixteenth * 2 },
    { f: F['E4'], d: sixteenth * 2 },
    { f: F['F#4'], d: sixteenth * 2 },
    { f: F['G#4'], d: sixteenth * 2 },
    { f: F['A4'], d: sixteenth * 2 },
    { f: F['G#4'], d: sixteenth * 2 },
    { f: F['F#4'], d: sixteenth * 2 },
    { f: F['E4'], d: sixteenth * 2 },
  ];

  const riffLength = sixteenth * 16;
  const loopT = t % riffLength;

  let curTime = 0;
  let note = marimbaPattern[0];
  let noteT = 0;
  for (const n of marimbaPattern) {
    if (loopT >= curTime && loopT < curTime + n.d) {
      note = n;
      noteT = loopT - curTime;
      break;
    }
    curTime += n.d;
  }

  // Wooden Marimba sound (fast attack, woody harmonic ring)
  const marimbaEnv = Math.exp(-noteT * 14);
  const marimba = (
    Math.sin(2 * Math.PI * note.f * t) * 0.6 +
    Math.sin(2 * Math.PI * note.f * 3.8 * t) * 0.25 +
    Math.sin(2 * Math.PI * note.f * 2 * t) * 0.15
  ) * marimbaEnv;

  // Punchy acoustic kick beat on beat 1 and 3
  const beatT = (t % beat) / beat;
  const kick = (t % (beat * 2) < beat)
    ? Math.sin(2 * Math.PI * 55 * Math.exp(-beatT * 10) * t) * Math.exp(-beatT * 8) * 0.5
    : 0;

  // Snappy handclap on beats 2 and 4
  const isClapBeat = (t % (beat * 2)) >= beat;
  const clapEnv = isClapBeat ? Math.exp(-beatT * 18) : 0;
  const whiteNoise = (Math.random() * 2 - 1) * clapEnv * 0.22;

  // Sub bass groove in C# (69.3 Hz / 138.6 Hz)
  const bass = Math.sin(2 * Math.PI * 69.3 * t) * 0.3;

  return (marimba * 0.5 + kick * 0.3 + whiteNoise * 0.2 + bass * 0.25) * 0.85;
});

// --- 4. TU AGAR MERI (Romantic Ballad, Lush Violin, Acoustic Piano, Heartwarming) ---
createWavFile('tu-agar-meri.wav', 42, (t) => {
  // Tempo 82 BPM => 1 beat = 0.732s
  const beat = 0.732;

  // "Tu agar meri... ye hawāyein teri... tu agar meri... saari raahein teri... main hoon tera"
  const melodyNotes = [
    { f: F.G4, d: beat * 1.0 }, { f: F.A4, d: beat * 1.0 }, { f: F.B4, d: beat * 1.5 },
    { f: F.D5, d: beat * 1.5 }, { f: F.C5, d: beat * 0.8 }, { f: F.B4, d: beat * 0.8 },
    { f: F.A4, d: beat * 2.0 },
    // "Ye hawayein teri..."
    { f: F.F4, d: beat * 0.8 }, { f: F.G4, d: beat * 0.8 }, { f: F.A4, d: beat * 1.5 },
    { f: F.C5, d: beat * 1.2 }, { f: F.B4, d: beat * 0.8 }, { f: F.A4, d: beat * 0.8 },
    { f: F.G4, d: beat * 2.2 },
    // "Betaab sa mohabbat ka tu inqilaab hai..."
    { f: F.B4, d: beat * 1.0 }, { f: F.C5, d: beat * 1.0 }, { f: F.D5, d: beat * 1.5 },
    { f: F.E5, d: beat * 1.5 }, { f: F.D5, d: beat * 1.0 }, { f: F.C5, d: beat * 1.0 },
    { f: F.B4, d: beat * 1.0 }, { f: F.A4, d: beat * 1.0 }, { f: F.G4, d: beat * 2.5 }
  ];

  const totalMelDuration = melodyNotes.reduce((acc, n) => acc + n.d, 0);
  const loopT = t % totalMelDuration;

  let curTime = 0;
  let activeNote = melodyNotes[0];
  let noteT = 0;
  for (const n of melodyNotes) {
    if (loopT >= curTime && loopT < curTime + n.d) {
      activeNote = n;
      noteT = loopT - curTime;
      break;
    }
    curTime += n.d;
  }

  // Romantic Legato Acoustic Violin & Cello Melody
  const vib = 1 + 0.012 * Math.sin(2 * Math.PI * 5.2 * t);
  const freq = activeNote.f * vib;
  const violinEnv = Math.min(noteT * 4, 1) * Math.exp(-noteT * 0.25);
  const violin = (
    Math.sin(2 * Math.PI * freq * t) * 0.45 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.25 +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.15 +
    Math.sin(2 * Math.PI * freq * 4 * t) * 0.08
  ) * violinEnv;

  // Soft Acoustic Piano Arpeggios (in G major / E minor)
  const arpT = (t % (beat * 0.5)) / (beat * 0.5);
  const arpFreqs = [F.G3, F.B3, F.D4, F.G4, F.D4, F.B3];
  const arpIndex = Math.floor((t / (beat * 0.5)) % arpFreqs.length);
  const piano = Math.sin(2 * Math.PI * arpFreqs[arpIndex] * t) * Math.exp(-arpT * 5) * 0.22;

  // Warm cello bass support
  const bass = Math.sin(2 * Math.PI * 98.0 * t) * 0.25;

  return (violin * 0.55 + piano * 0.3 + bass * 0.25) * 0.9;
});

// --- 5. KAR POROKH (Assamese Soulful Folk Ballad, Bahi Flute, River Breeze) ---
createWavFile('kar-porokh.wav', 44, (t) => {
  // Tempo 84 BPM => 1 beat = 0.714s
  const beat = 0.714;

  // "Kaar porokh, kaar haahaakaar khubaakh, kaar tita mitha ekhari maat..."
  // Folk melody in F major / D minor: F4 -> A4 -> C5 -> Bb4 -> A4 -> G4 -> F4 -> D4 -> F4 -> G4 -> A4
  const folkNotes = [
    { f: F.F4, d: beat * 1.0 }, { f: F.A4, d: beat * 1.2 }, { f: F.C5, d: beat * 1.5 },
    { f: F.Bb4, d: beat * 0.8 }, { f: F.A4, d: beat * 1.0 }, { f: F.G4, d: beat * 1.5 },
    { f: F.F4, d: beat * 1.0 }, { f: F.D4, d: beat * 1.0 }, { f: F.F4, d: beat * 1.5 },
    { f: F.G4, d: beat * 1.2 }, { f: F.A4, d: beat * 2.0 },
    // "Jiyaai thaakibo re laage aamaak..."
    { f: F.C5, d: beat * 1.0 }, { f: F.D5, d: beat * 1.2 }, { f: F.F5, d: beat * 1.5 },
    { f: F.D5, d: beat * 0.8 }, { f: F.C5, d: beat * 1.5 }, { f: F.A4, d: beat * 1.0 },
    { f: F.G4, d: beat * 1.0 }, { f: F.F4, d: beat * 2.2 }
  ];

  const totalMelDuration = folkNotes.reduce((acc, n) => acc + n.d, 0);
  const loopT = t % totalMelDuration;

  let curTime = 0;
  let activeNote = folkNotes[0];
  let noteT = 0;
  for (const n of folkNotes) {
    if (loopT >= curTime && loopT < curTime + n.d) {
      activeNote = n;
      noteT = loopT - curTime;
      break;
    }
    curTime += n.d;
  }

  // Assamese Bamboo Bahi Flute tone with sweet emotional ornamentation
  const vib = 1 + 0.01 * Math.sin(2 * Math.PI * 4.9 * t);
  const freq = activeNote.f * vib;
  const fluteEnv = Math.min(noteT * 5, 1) * Math.exp(-noteT * 0.35);
  const flute = (
    Math.sin(2 * Math.PI * freq * t) * 0.5 +
    Math.sin(2 * Math.PI * freq * 2 * t) * 0.22 +
    Math.sin(2 * Math.PI * freq * 3 * t) * 0.12 +
    Math.sin(2 * Math.PI * freq * 4 * t) * 0.06
  ) * fluteEnv;

  // Gentle river folk acoustic guitar strumming
  const strumT = (t % beat) / beat;
  const strum = (
    Math.sin(2 * Math.PI * 174.61 * t) * 0.2 +
    Math.sin(2 * Math.PI * 261.63 * t) * 0.15 +
    Math.sin(2 * Math.PI * 349.23 * t) * 0.1
  ) * Math.exp(-strumT * 6);

  // Soft earthen folk dholak pulse
  const dholak = Math.sin(2 * Math.PI * 65 * Math.exp(-strumT * 8) * t) * Math.exp(-strumT * 7) * 0.25;

  return (flute * 0.6 + strum * 0.25 + dholak * 0.2) * 0.9;
});

console.log('All 5 default permanent audio files generated successfully!');
