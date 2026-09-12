export type UserRole = 'patient' | 'caregiver';

export interface UserAccessibilitySettings {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceAssistance: boolean;
  speechRate: number;
  simpleNavigation: boolean;
}

export type LanguageOption =
  | 'en'
  | 'as' // Assamese (অসমীয়া) - Assam
  | 'bn' // Bengali (বাংলা) - Tripura & Assam
  | 'mni' // Manipuri / Meitei (মৈতৈলোন্) - Manipur
  | 'brx' // Bodo (बर') - Bodoland, Assam
  | 'lus' // Mizo (Mizo ṭawng) - Mizoram
  | 'kha' // Khasi (Ka Ktien Khasi) - Meghalaya
  | 'grt' // Garo (A·chik) - Meghalaya
  | 'ne'  // Nepali (नेपाली) - Sikkim & North East
  | 'ao'  // Ao / Nagamese - Nagaland
  | 'trp' // Kokborok - Tripura
  | 'hi'  // Hindi (हिन्दी)
  | 'es'  // Spanish (Español)
  | 'fr'  // French (Français)
  | 'de'; // German (Deutsch)

export interface PatientLocation {
  latitude: number;
  longitude: number;
  address: string;
  accuracy: number; // in meters
  batteryLevel?: number; // 0 to 100
  status: 'at_home' | 'safe_zone' | 'away' | 'wandering_alert';
  lastUpdated: string;
  homeLatitude: number;
  homeLongitude: number;
  homeAddress: string;
  safeZoneRadiusMeters: number;
}

export interface LocationBreadcrumb {
  _id: string;
  patientId: string;
  latitude: number;
  longitude: number;
  address: string;
  status: 'at_home' | 'safe_zone' | 'away' | 'wandering_alert';
  timestamp: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  gender?: 'male' | 'female' | 'other';
  patientId?: string;
  avatar?: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  language: LanguageOption;
  accessibilitySettings: UserAccessibilitySettings;
  cognitiveDifficulty: 'easy' | 'medium' | 'hard';
  location?: PatientLocation;
  locationHistory?: LocationBreadcrumb[];
  createdAt: string;
  updatedAt?: string;
}

export interface ImageAnalysisResult {
  category: 'medication' | 'clock' | 'family_photo' | 'document' | 'hydration' | 'general';
  title: string;
  confidence: 'high' | 'medium' | 'moderate';
  ocrText?: string;
  scheduleMatch?: string;
  safetyNotice?: string;
  actionableAdvice: string;
  reply: string;
  timestamp: string;
}

export interface AudioAnalysisResult {
  transcription: string;
  sentiment: 'peaceful' | 'happy' | 'mildly_anxious' | 'confused' | 'tired' | 'seeking_comfort';
  sentimentLabel: string;
  cognitiveClarity: 'alert' | 'moderate_hesitation' | 'disoriented';
  emotionalDistressLevel: number; // 0 to 10
  keyNeeds: string[];
  supportiveReply: string;
  caregiverAlert: string | null;
  timestamp: string;
}

export interface TextAnalysisResult {
  intent: 'question' | 'memory_lookup' | 'reminder_inquiry' | 'disoriented_grounding' | 'gratitude' | 'general';
  isDisoriented: boolean;
  groundingMessage?: string;
  reply: string;
  detectedLanguage: string;
  actionTaken?: 'reminder_completed' | 'reminder_created' | 'grounding_provided' | 'camera_analyzed';
  affectedReminder?: Reminder;
  timestamp: string;
}

export interface ReminderTune {
  id: string;
  name: string;
  description: string;
  mood: string;
  icon: string;
}

export const REMINDER_TUNES: ReminderTune[] = [
  {
    id: 'morning-bells',
    name: 'Morning Bells Lullaby',
    description: 'Gentle, comforting chime melody in C-major. Ideal for daily medications and wake-up.',
    mood: 'Soothing & Gentle',
    icon: '🔔',
  },
  {
    id: 'calm-forest',
    name: 'Calm Forest Melody',
    description: 'Serene pentatonic acoustic melody evoking morning breeze and quiet nature.',
    mood: 'Peaceful & Grounding',
    icon: '🌲',
  },
  {
    id: 'sunshine-tune',
    name: 'Sunshine Garden Melody',
    description: 'Warm, cheerful uplifting chime in G-major for daytime walks and lunch.',
    mood: 'Joyful & Encouraging',
    icon: '☀️',
  },
  {
    id: 'temple-chimes',
    name: 'Serene Temple Singing Chimes',
    description: 'Deep resonant, meditative acoustic chimes inspired by Himalayan bells.',
    mood: 'Centering & Meditative',
    icon: '🪷',
  },
  {
    id: 'gentle-harmony',
    name: 'Pastoral Afternoon Harmony',
    description: 'Warm classical chord progression with long soothing decay for evening unwind.',
    mood: 'Relaxing & Restful',
    icon: '🎵',
  },
];

export const DEFAULT_FEMALE_PATIENT_AVATAR =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=250&auto=format&fit=crop&q=80';
export const DEFAULT_MALE_PATIENT_AVATAR =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=250&auto=format&fit=crop&q=80';
export const DEFAULT_FEMALE_CAREGIVER_AVATAR =
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80';
export const DEFAULT_MALE_CAREGIVER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=250&auto=format&fit=crop&q=80';

export const DEFAULT_FEMALE_AVATAR = DEFAULT_FEMALE_PATIENT_AVATAR;
export const DEFAULT_MALE_AVATAR = DEFAULT_MALE_PATIENT_AVATAR;

export const AVATAR_PRESETS: any[] = [];

export interface Memory {
  _id: string;
  patientId: string;
  title: string;
  personName?: string;
  relationship: string;
  description: string;
  photoUrl: string;
  tags?: string[];
  dateEra?: string;
  createdAt: string;
}

export interface Reminder {
  _id: string;
  patientId: string;
  title: string;
  time: string;
  category: 'medication' | 'meal' | 'activity' | 'appointment' | 'hydration' | 'task' | 'routine';
  completed: boolean;
  recurrence: string;
  date?: string;
  notes?: string;
  description?: string;
  priority?: 'normal' | 'high' | 'urgent';
  soundEnabled?: boolean;
  soundTune?: string;
  createdAt: string;
}

export interface GameResult {
  _id: string;
  patientId: string;
  gameType: 'memory-match' | 'picture-recall' | 'number-recall' | 'pattern-recognition';
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  accuracy: number;
  responseTimeMs: number;
  attempts: number;
  mistakes: number;
  completedAt: string;
}

export interface GameProgress {
  memoryScore: number;
  attentionScore: number;
  recallScore: number;
  overallScore: number;
  currentDifficulty: 'easy' | 'medium' | 'hard';
  totalGamesPlayed: number;
  completedToday: number;
  trendData: Array<{
    date: string;
    timestamp?: string;
    accuracy: number;
    responseTime: number;
    score?: number;
    gameType?: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  imagePreview?: string;
  actionTaken?: 'reminder_completed' | 'reminder_created' | 'camera_analyzed';
  affectedReminder?: Reminder;
}

export interface DatabaseStatus {
  isMongoConnected: boolean;
  mongoConnectionError: string | null;
  engine: string;
  databaseName: string;
  uriConfigured: boolean;
  counts: {
    users: number;
    memories: number;
    reminders: number;
    gameResults: number;
  };
}

export interface AppNotification {
  _id: string;
  patientId: string;
  caregiverId?: string;
  title: string;
  message: string;
  type: 'game_completed' | 'reminder_due' | 'difficulty_adapted' | 'note';
  read: boolean;
  createdAt: string;
}

export interface CognitivePerformanceReport {
  patientId: string;
  patientName: string;
  overallCognitiveIndex: number;
  stabilityStatus: 'improving' | 'stable' | 'needs_attention';
  retentionRate: number;
  averageResponseTimeSec: number;
  mistakeFrequency: number;
  routineAdherencePercent: number;
  totalSessionsPlayed: number;
  cognitiveDomainBreakdown: {
    visualMemory: number;
    workingMemory: number;
    executiveFunction: number;
    processingSpeed: number;
  };
  strengths: string[];
  areasToSupport: string[];
  recommendations: string[];
  summary: string;
  generatedAt: string;
}

export interface CaregiverObservation {
  id: string;
  date: string;
  mood: 'cheerful' | 'calm' | 'thoughtful' | 'restless' | 'fatigued';
  sleepQuality: 'peaceful' | 'average' | 'interrupted';
  waterIntakeGlasses: number;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export type SongCategory = 'classical' | 'nostalgia' | 'nature' | 'ambient' | 'custom';

export interface SongTrack {
  id: string;
  patientId?: string;
  title: string;
  artist: string;
  category: SongCategory;
  durationSeconds: number;
  audioUrl: string;
  coverImage: string;
  eraOrMood: string;
  description: string;
  synthesizedNotes?: { note: string; duration: number }[];
  isCustom?: boolean;
  isFavorite?: boolean;
  createdAt?: string;
}

export interface CustomSongInput {
  title: string;
  artist?: string;
  category?: SongCategory;
  audioUrl: string;
  coverImage?: string;
  eraOrMood?: string;
  description?: string;
  patientId?: string;
}
