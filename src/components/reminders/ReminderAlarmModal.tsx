import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Sparkles,
  Pill,
  Droplets,
  Utensils,
  Footprints,
  Calendar,
  PhoneCall,
  CheckSquare,
  AlertCircle,
  X,
  Music,
} from 'lucide-react';
import { Reminder, REMINDER_TUNES } from '../../types';
import { reminderAudio } from '../../utils/reminderAudio';
import { useAccessibility } from '../../context/AccessibilityContext';

interface ReminderAlarmModalProps {
  reminder: Reminder | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (reminder: Reminder) => void;
  onSnooze: (reminder: Reminder) => void;
}

export const ReminderAlarmModal: React.FC<ReminderAlarmModalProps> = ({
  reminder,
  isOpen,
  onClose,
  onComplete,
  onSnooze,
}) => {
  const { speakText, fontSize } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => reminderAudio.isMuted());
  const [currentTune, setCurrentTune] = useState<string>('morning-bells');
  const [volume, setVolume] = useState<number>(() => reminderAudio.getVolume());

  useEffect(() => {
    const unsub = reminderAudio.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen && reminder) {
      const tuneToPlay = reminder.soundTune || 'morning-bells';
      setCurrentTune(tuneToPlay);
      if (reminder.soundEnabled !== false && !reminderAudio.isMuted()) {
        reminderAudio.playTune(tuneToPlay, true);
      }
      // Voice announcement for elderly patients
      speakText(
        `Reminder: It is time for ${reminder.title}. Scheduled for ${reminder.time}. ${
          reminder.notes || reminder.description || ''
        }`
      );
    } else {
      reminderAudio.stop();
    }

    return () => {
      reminderAudio.stop();
    };
  }, [isOpen, reminder]);

  if (!isOpen || !reminder) return null;

  const activeTuneObj = REMINDER_TUNES.find((t) => t.id === currentTune) || REMINDER_TUNES[0];

  const handleMuteToggle = () => {
    const next = !isMuted;
    setIsMuted(next);
    reminderAudio.setMuted(next);
    if (!next) {
      reminderAudio.playTune(currentTune, true);
    }
  };

  const handleSwitchTune = (newTuneId: string) => {
    setCurrentTune(newTuneId);
    if (!isMuted) {
      reminderAudio.playTune(newTuneId, true);
    }
  };

  const handleVolumeChange = (newVal: number) => {
    setVolume(newVal);
    reminderAudio.setVolume(newVal);
  };

  const handleMarkDone = () => {
    reminderAudio.stop();
    reminderAudio.playGentleChime();
    onComplete(reminder);
  };

  const handleSnooze = () => {
    reminderAudio.stop();
    reminderAudio.playSnoozeTone();
    onSnooze(reminder);
  };

  const handleDismiss = () => {
    reminderAudio.stop();
    onClose();
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication':
        return <Pill className="w-8 h-8 text-rose-600" />;
      case 'hydration':
        return <Droplets className="w-8 h-8 text-blue-600" />;
      case 'meal':
        return <Utensils className="w-8 h-8 text-amber-600" />;
      case 'activity':
        return <Footprints className="w-8 h-8 text-emerald-600" />;
      case 'appointment':
        return <Calendar className="w-8 h-8 text-purple-600" />;
      case 'routine':
      case 'task':
      default:
        return <CheckSquare className="w-8 h-8 text-teal-600" />;
    }
  };

  return (
    <div
      id="reminder-alarm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        id="reminder-alarm-card"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border-4 border-amber-400 relative overflow-hidden"
      >
        {/* Animated Soundwave Banner with Song Identifier */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-5 rounded-t-2xl relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white animate-bounce shadow-inner">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-black tracking-widest text-amber-100 block">
                  MindCare Real-Time Reminder
                </span>
                <span className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Song: {activeTuneObj.name}</span>
                  {isPlaying && !isMuted && (
                    <span className="inline-flex items-center gap-1">
                      <span className="w-1.5 h-3 bg-white rounded-full animate-pulse" />
                      <span className="w-1.5 h-4 bg-white rounded-full animate-pulse delay-75" />
                      <span className="w-1.5 h-2 bg-white rounded-full animate-pulse delay-150" />
                    </span>
                  )}
                </span>
              </div>
            </div>

            {/* Quick Mute / Sound Toggle */}
            <button
              id="alarm-modal-mute-btn"
              type="button"
              onClick={handleMuteToggle}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-600 text-white border-rose-400'
                  : 'bg-white/20 hover:bg-white/30 text-white border-white/30'
              }`}
              title={isMuted ? 'Unmute Song' : 'Mute Song'}
              aria-label={isMuted ? 'Unmute reminder song' : 'Mute reminder song'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Reminder Details */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center shrink-0 shadow-xs">
              {getCategoryIcon(reminder.category)}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider mb-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Scheduled for {reminder.time}</span>
              </div>
              <h2
                id="alarm-modal-title"
                className={`font-black text-slate-900 leading-snug ${
                  fontSize === 'extra-large' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
                }`}
              >
                {reminder.title}
              </h2>
            </div>
          </div>

          {(reminder.notes || reminder.description) && (
            <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl text-amber-950 text-sm sm:text-base leading-relaxed">
              <span className="font-bold block text-xs uppercase tracking-wider text-amber-800 mb-0.5">
                Care Instructions:
              </span>
              {reminder.notes || reminder.description}
            </div>
          )}

          {/* Song Switcher Pill Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-600" />
                <span>Reminder Tune ({activeTuneObj.description})</span>
              </span>
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                <input
                  id="alarm-modal-volume-slider"
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1.5 accent-amber-600 rounded-lg cursor-pointer"
                  title="Volume level"
                  aria-label="Volume level"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {REMINDER_TUNES.map((t) => (
                <button
                  key={t.id}
                  id={`alarm-tune-select-${t.id}`}
                  type="button"
                  onClick={() => handleSwitchTune(t.id)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    currentTune === t.id
                      ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span>{t.icon}</span>
                  <span>{t.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audio helper prompt */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
            <button
              id="alarm-modal-listen-aloud-btn"
              type="button"
              onClick={() =>
                speakText(
                  `Reminder for ${reminder.title} at ${reminder.time}. ${
                    reminder.notes || reminder.description || ''
                  }`
                )
              }
              className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Listen Voice Announcement</span>
            </button>
            <span className="text-slate-400">Repeats: {reminder.recurrence || 'Daily'}</span>
          </div>
        </div>

        {/* Action Buttons (Large, Accessible, High Contrast) */}
        <div className="space-y-2.5 pt-1">
          {/* 1. Mark Done (Primary Action) */}
          <button
            id="alarm-modal-done-btn"
            type="button"
            onClick={handleMarkDone}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-lg sm:text-xl rounded-2xl shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3 min-h-[58px]"
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>Mark as Done</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            {/* 2. Snooze 5 mins */}
            <button
              id="alarm-modal-snooze-btn"
              type="button"
              onClick={handleSnooze}
              className="py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 font-extrabold text-sm sm:text-base rounded-xl border border-amber-300 transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Snooze (5 min)</span>
            </button>

            {/* 3. Dismiss Alarm */}
            <button
              id="alarm-modal-dismiss-btn"
              type="button"
              onClick={handleDismiss}
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm sm:text-base rounded-xl border border-slate-300 transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <X className="w-4 h-4" />
              <span>Dismiss Song</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
