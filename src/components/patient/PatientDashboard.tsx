import React, { useEffect, useState, useRef } from 'react';
import {
  Brain,
  BookOpen,
  Sparkles,
  Bell,
  Volume2,
  TrendingUp,
  Heart,
  Calendar,
  CheckCircle2,
  PhoneCall,
  Flame,
  Award,
  LogOut,
  UserCheck,
  Music,
  CheckSquare,
  Clock,
  Plus,
  Play,
  Square,
  Droplets,
  Pill,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { GameProgress, Reminder } from '../../types';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';
import { reminderAudio } from '../../utils/reminderAudio';
import { ReminderAlarmModal } from '../reminders/ReminderAlarmModal';

interface PatientDashboardProps {
  onNavigate: (view: string) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const { t, speakText, fontSize, highContrast } = useAccessibility();

  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);
  const [isSongPlaying, setIsSongPlaying] = useState(false);

  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Determine time-appropriate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 17) return t('goodAfternoon');
    return t('goodEvening');
  };

  const patientName = user?.name || 'Eleanor';
  const greetingText = `${getGreeting()}, ${patientName}!`;

  useEffect(() => {
    const loadData = async () => {
      const pId = user?._id || 'patient_eleanor';
      try {
        const [progData, remData] = await Promise.all([
          api.getGameProgress(pId),
          api.getReminders(pId),
        ]);
        setProgress(progData);
        setReminders(remData);
      } catch (err) {
        console.warn('Failed to fetch patient dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  // Sync patient's live location with caregiver safe zone tracking
  useEffect(() => {
    const pId = user?._id || 'patient_eleanor';
    const reportCurrentLocation = () => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await api.updatePatientLocation(pId, {
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                accuracy: Math.round(pos.coords.accuracy),
              });
            } catch (err) {
              console.warn('Silent location report error:', err);
            }
          },
          (err) => {
            console.warn('Geolocation permission or error:', err.message);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      }
    };

    reportCurrentLocation();
    const interval = setInterval(reportCurrentLocation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?._id]);

  // Subscribe to audio engine changes
  useEffect(() => {
    const unsub = reminderAudio.subscribe((playing) => {
      setIsSongPlaying(playing);
    });
    return () => unsub();
  }, []);

  // Background reminder alarm checker on the home dashboard
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const nowTime = `${hours}:${minutes}`;

      reminders.forEach((r) => {
        if (!r.completed && r.time) {
          const normalized = r.time.replace(/\s*[AP]M/i, '').trim();
          const parts = normalized.split(':');
          if (parts.length === 2) {
            const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
            const key = `${r._id}_${nowTime}`;

            if (formatted === nowTime && !triggeredAlarmsRef.current.has(key)) {
              triggeredAlarmsRef.current.add(key);
              if (r.soundEnabled !== false) {
                setActiveAlarmReminder(r);
              }
            }
          }
        }
      });
    };

    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, [reminders]);

  const handleQuickToggleReminder = async (r: Reminder) => {
    const newStatus = !r.completed;
    try {
      const updated = await api.updateReminder(r._id, { completed: newStatus });
      setReminders((prev) => prev.map((item) => (item._id === r._id ? updated : item)));
      if (newStatus) {
        reminderAudio.playGentleChime();
        speakText(`Splendid! You completed ${r.title}.`);
      }
    } catch (e) {
      console.warn('Failed to update reminder:', e);
    }
  };

  const handleAlarmComplete = async (r: Reminder) => {
    setActiveAlarmReminder(null);
    await handleQuickToggleReminder(r);
  };

  const handleAlarmSnooze = async (r: Reminder) => {
    setActiveAlarmReminder(null);
    const [h, m] = r.time.split(':').map((v) => parseInt(v, 10) || 0);
    const newMin = (m + 5) % 60;
    const newHour = m + 5 >= 60 ? (h + 1) % 24 : h;
    const newTimeStr = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;

    try {
      const updated = await api.updateReminder(r._id, { time: newTimeStr });
      setReminders((prev) => prev.map((item) => (item._id === r._id ? updated : item)));
      speakText(`Snoozed ${r.title} for 5 minutes.`);
    } catch (e) {
      console.warn('Failed to snooze reminder:', e);
    }
  };

  // Read aloud welcome summary
  const handleReadWelcome = () => {
    const mem = progress ? progress.memoryScore : 92;
    const pendingReminders = reminders.filter((r) => !r.completed);
    const summary = `${greetingText}. Welcome to your MindCare dashboard. Today, your cognitive memory progress is ${mem} percent. You have ${pendingReminders.length} reminder${pendingReminders.length === 1 ? '' : 's'} scheduled. What activity would you like to enjoy right now?`;
    speakText(summary);
  };

  const completedRemindersCount = reminders.filter((r) => r.completed).length;

  return (
    <div id="patient-dashboard" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Reassuring Greeting Card with Large Audio Read Button */}
      <section
        id="patient-greeting-card"
        className="bg-gradient-to-br from-teal-700 via-teal-800 to-emerald-900 rounded-3xl text-white p-6 sm:p-9 shadow-md relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Heart className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-600/60 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-teal-100 border border-teal-500/30">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <h1
              id="patient-greeting-title"
              className={`font-black tracking-tight leading-tight ${
                fontSize === 'extra-large' ? 'text-4xl sm:text-5xl' : fontSize === 'large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              {greetingText}
            </h1>
            <p className="text-teal-100 text-base sm:text-lg max-w-xl">
              Welcome back to your comfort space. Take a gentle breath, explore your memories, or stimulate your brain with a relaxing game.
            </p>
          </div>

          <button
            id="read-welcome-btn"
            onClick={handleReadWelcome}
            className="flex items-center gap-3 bg-white hover:bg-teal-50 text-teal-900 px-5 py-3.5 rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex-shrink-0"
            aria-label="Read greeting aloud"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
              <Volume2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="block text-xs uppercase tracking-wider text-teal-700 font-extrabold">{t('audioHelp')}</span>
              <span className="block text-sm font-bold leading-tight">{t('readAloud')}</span>
            </div>
          </button>
        </div>

        {/* Reassuring Caregiver Location Tracking Status */}
        <div
          id="patient-location-safety-badge"
          className="mt-6 pt-4 border-t border-teal-600/50 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-teal-100 relative z-10"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse shrink-0" />
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
              {t('patientProtectedByTracking')}
            </span>
            <span className="text-teal-200 hidden md:inline">
              — {t('locationSharedWithCaregiver')}
            </span>
          </div>
          <span className="bg-teal-900/50 border border-teal-400/40 px-3 py-1 rounded-full font-bold text-teal-200 text-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-300" />
            {t('safeAtHome')}
          </span>
        </div>
      </section>

      {/* TODAY'S ACTIVITIES - Primary Action Cards (Oversized, High Readability) */}
      <section id="todays-activities-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2
            id="todays-activities-heading"
            className={`font-black text-slate-900 flex items-center gap-2.5 ${
              fontSize === 'extra-large' ? 'text-3xl' : fontSize === 'large' ? 'text-2xl' : 'text-xl'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-teal-500 inline-block" />
            {t('todaysActivities')}
          </h2>
          <span className="text-sm font-semibold text-slate-500 hidden sm:inline">Tap any card to start</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          {/* 1. Play Memory Game */}
          <button
            id="act-play-game-btn"
            onClick={() => onNavigate('games')}
            className={`group bg-white rounded-3xl p-6 border-2 transition-all text-left shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[220px] ${
              highContrast
                ? 'border-slate-900 hover:border-black'
                : 'border-emerald-100 hover:border-emerald-400 bg-gradient-to-b from-white to-emerald-50/40'
            }`}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {t('playMemoryGame')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('gameDesc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-emerald-700 font-bold text-sm">
              <span>{t('startGame')}</span>
              <span className="text-lg">→</span>
            </div>
          </button>

          {/* 2. My Memories */}
          <button
            id="act-my-memories-btn"
            onClick={() => onNavigate('memories')}
            className={`group bg-white rounded-3xl p-6 border-2 transition-all text-left shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[220px] ${
              highContrast
                ? 'border-slate-900 hover:border-black'
                : 'border-blue-100 hover:border-blue-400 bg-gradient-to-b from-white to-blue-50/40'
            }`}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {t('myMemories')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('memoriesDesc')}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-blue-700 font-bold text-sm">
              <span>{t('openPhotoBook')}</span>
              <span className="text-lg">→</span>
            </div>
          </button>

          {/* 3. Ask AI Voice & Camera Assistant */}
          <button
            id="act-ask-ai-btn"
            onClick={() => onNavigate('ai')}
            className={`group bg-white rounded-3xl p-6 border-2 transition-all text-left shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[220px] ${
              highContrast
                ? 'border-slate-900 hover:border-black'
                : 'border-purple-100 hover:border-purple-400 bg-gradient-to-b from-white to-purple-50/40'
            }`}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs relative">
                <Sparkles className="w-8 h-8" />
                <span className="absolute -bottom-1 -right-1 bg-purple-800 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  AI + Cam
                </span>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {t('voiceCameraAI')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('voiceCameraDesc')}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                  🎤 Voice
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                  📷 Camera
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  🔔 Reminders
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-purple-700 font-bold text-sm">
              <span>{t('askAI')}</span>
              <span className="text-lg">→</span>
            </div>
          </button>

          {/* 4. Schedule & Melodic Reminders */}
          <button
            id="act-my-reminders-btn"
            onClick={() => onNavigate('reminders')}
            className={`group bg-white rounded-3xl p-6 border-2 transition-all text-left shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[220px] ${
              highContrast
                ? 'border-slate-900 hover:border-black'
                : 'border-amber-100 hover:border-amber-400 bg-gradient-to-b from-white to-amber-50/40'
            }`}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs relative">
                <Bell className="w-8 h-8" />
                {reminders.filter((r) => !r.completed).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {reminders.filter((r) => !r.completed).length}
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {t('scheduleReminders')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('remindersDesc')}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Music className="w-3 h-3 text-amber-700" />
                  <span>Default Song</span>
                </span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                  {reminders.filter((r) => !r.completed).length} Pending
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-amber-800 font-bold text-sm">
              <span>{t('viewAllReminders')}</span>
              <span className="text-lg">→</span>
            </div>
          </button>

          {/* 5. Relaxing Songs & Music Therapy */}
          <button
            id="act-music-therapy-btn"
            onClick={() => onNavigate('music')}
            className={`group bg-white rounded-3xl p-6 border-2 transition-all text-left shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between min-h-[220px] ${
              highContrast
                ? 'border-slate-900 hover:border-black'
                : 'border-rose-100 hover:border-rose-400 bg-gradient-to-b from-white to-rose-50/40'
            }`}
          >
            <div className="space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs relative">
                <Music className="w-8 h-8" />
                <span className="absolute -bottom-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase">
                  Play
                </span>
              </div>
              <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
                {t('relaxingSongs')}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {t('songsDesc')}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md">
                  🎵 Custom Songs
                </span>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                  🎹 Piano & Nature
                </span>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-rose-700 font-bold text-sm">
              <span>{t('listenSongs')}</span>
              <span className="text-lg">→</span>
            </div>
          </button>
        </div>
      </section>

      {/* TODAY'S SCHEDULE & MELODIC REMINDERS HIGHLIGHT */}
      <section
        id="todays-schedule-highlight"
        className="bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/90 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl sm:text-2xl text-slate-900">
                  {t('scheduleReminders')}
                </h3>
                <span className="text-xs font-bold bg-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full hidden sm:inline">
                  Melodic Alert Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                {completedRemindersCount} of {reminders.length} tasks completed today. Tap any item to complete.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Song Preview Button */}
            <button
              id="dashboard-preview-song-btn"
              type="button"
              onClick={() => {
                if (isSongPlaying) {
                  reminderAudio.stop();
                } else {
                  reminderAudio.playDefaultReminderSong(false);
                  speakText('Playing the comforting default reminder song.');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSongPlaying
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
              }`}
            >
              {isSongPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>{t('stopMelody')}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t('testReminderMelody')}</span>
                </>
              )}
            </button>

            {/* Manage Schedule Button */}
            <button
              id="dashboard-manage-schedule-btn"
              type="button"
              onClick={() => onNavigate('reminders')}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs sm:text-sm font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addTaskReminder')}</span>
            </button>
          </div>
        </div>

        {/* Quick Task List Preview (Top 3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {reminders.slice(0, 3).map((rem) => (
            <div
              key={rem._id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                rem.completed
                  ? 'bg-emerald-50/50 border-emerald-200 opacity-80'
                  : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {rem.time}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800">
                    {rem.category}
                  </span>
                </div>
                <h4
                  className={`font-black text-sm text-slate-900 leading-snug line-clamp-1 ${
                    rem.completed ? 'line-through text-slate-400' : ''
                  }`}
                >
                  {rem.title}
                </h4>
                {rem.notes && (
                  <p className="text-[11px] text-slate-500 line-clamp-1">{rem.notes}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleQuickToggleReminder(rem)}
                className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  rem.completed
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 border-slate-200'
                }`}
                title={rem.completed ? 'Mark incomplete' : 'Mark done'}
                aria-label={`Mark ${rem.title} done`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* TODAY'S PROGRESS - Metrics Section */}
      <section id="todays-progress-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2
              id="todays-progress-heading"
              className={`font-black text-slate-900 flex items-center gap-2.5 ${
                fontSize === 'extra-large' ? 'text-3xl' : fontSize === 'large' ? 'text-2xl' : 'text-xl'
              }`}
            >
              <TrendingUp className="w-6 h-6 text-teal-600" />
              {t('todaysProgress')}
            </h2>
            <p className="text-slate-600 text-sm mt-0.5">
              Reflects your recent cognitive engagement and exercise performance.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200/80 px-4 py-2 rounded-2xl">
            <Award className="w-5 h-5 text-teal-700" />
            <div className="text-left">
              <span className="block text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                {t('adaptiveLevel')}
              </span>
              <span className="block text-sm font-extrabold text-teal-900 capitalize">
                {progress?.currentDifficulty === 'hard'
                  ? t('hard')
                  : progress?.currentDifficulty === 'medium'
                  ? t('medium')
                  : t('easy')}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Main Progress Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Memory: XX% */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-700">{t('memory')}</span>
              <span className="text-2xl font-black text-teal-700">
                {progress?.memoryScore ?? 92}%
              </span>
            </div>
            {/* Accessible Large Bar */}
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-teal-600 rounded-full transition-all duration-700"
                style={{ width: `${progress?.memoryScore ?? 92}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">Memory match and recall visual exercises</p>
          </div>

          {/* Attention: XX% */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-700">{t('attention')}</span>
              <span className="text-2xl font-black text-indigo-700">
                {progress?.attentionScore ?? 88}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-700"
                style={{ width: `${progress?.attentionScore ?? 88}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">Pattern recognition and focus rhythm</p>
          </div>

          {/* Recall: XX% */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-700">{t('recall')}</span>
              <span className="text-2xl font-black text-emerald-700">
                {progress?.recallScore ?? 90}%
              </span>
            </div>
            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                style={{ width: `${progress?.recallScore ?? 90}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-medium">Picture item recognition & number memory</p>
          </div>
        </div>
      </section>

      {/* Emergency & Family Support Contact Footer */}
      <section
        id="family-support-card"
        className="bg-teal-50/70 border border-teal-200/70 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-base sm:text-lg text-slate-900">
              {t('familyEmergency')}
            </h4>
            <p className="text-slate-600 text-sm">
              {user?.emergencyContact?.name || 'Sarah Vance'} ({user?.emergencyContact?.relation || 'Daughter'}):{' '}
              <span className="font-bold text-teal-800">{user?.emergencyContact?.phone || '(555) 234-5678'}</span>
            </p>
          </div>
        </div>

        <button
          id="contact-caregiver-btn"
          onClick={() =>
            speakText(
              `Your primary contact is your daughter ${user?.emergencyContact?.name || 'Sarah Vance'}, telephone number ${
                user?.emergencyContact?.phone || '555 234 5678'
              }.`
            )
          }
          className="inline-flex items-center gap-2 bg-white hover:bg-teal-100 text-teal-900 px-4 py-2.5 rounded-xl font-bold border border-teal-300 text-sm transition-colors cursor-pointer"
        >
          <Volume2 className="w-4 h-4 text-teal-700" />
          <span>{t('audioHelp')}</span>
        </button>
      </section>

      {/* Account Status & Safe Sign Out for Elderly Patients */}
      <section
        id="patient-account-footer-strip"
        className="bg-slate-100/90 border border-slate-200/90 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5 text-left">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'Patient'}
            className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-600/30 shrink-0"
          />
          <div>
            <p className="text-sm font-extrabold text-slate-800">
              {t('activePatient')}: <span className="text-teal-700">{user?.name || 'Eleanor Vance'}</span>
            </p>
            <p className="text-xs text-slate-500">
              Your memory games, photo albums, and reminders are actively synced to MongoDB.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dashboard-read-status-btn"
            onClick={() =>
              speakText(
                `You are currently logged into MindCare as ${user?.name || 'Eleanor Vance'}. Everything is saved and ready for you.`
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold border border-slate-200 cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-teal-700" />
            <span>{t('audioHelp')}</span>
          </button>
          <button
            id="dashboard-signout-btn"
            onClick={() => setShowSignOutConfirm(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-900 px-4 py-2 rounded-xl font-extrabold border border-rose-200 text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>{t('signOut')}</span>
          </button>
        </div>
      </section>

      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={() => {
          logout();
          onNavigate('dashboard');
        }}
        userName={user?.name}
      />

      <ReminderAlarmModal
        reminder={activeAlarmReminder}
        isOpen={Boolean(activeAlarmReminder)}
        onClose={() => setActiveAlarmReminder(null)}
        onComplete={handleAlarmComplete}
        onSnooze={handleAlarmSnooze}
      />
    </div>
  );
};
