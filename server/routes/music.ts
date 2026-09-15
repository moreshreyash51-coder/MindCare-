import { Router } from 'express';

const musicRouter = Router();

export interface ServerSongTrack {
  id: string;
  title: string;
  artist: string;
  category: string;
  durationSeconds: number;
  audioUrl: string;
  coverImage: string;
  eraOrMood: string;
  description: string;
  youtubeId?: string;
  isPermanentDefault: boolean;
}

export const PERMANENT_DEFAULT_SONGS: ServerSongTrack[] = [
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
    isPermanentDefault: true,
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
    isPermanentDefault: true,
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
    isPermanentDefault: true,
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
    isPermanentDefault: true,
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
    isPermanentDefault: true,
  },
];

// GET /api/music/songs
musicRouter.get('/songs', (_req, res) => {
  res.json({
    success: true,
    songs: PERMANENT_DEFAULT_SONGS,
    count: PERMANENT_DEFAULT_SONGS.length,
  });
});

export { musicRouter };
