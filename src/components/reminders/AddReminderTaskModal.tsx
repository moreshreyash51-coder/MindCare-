import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Clock,
  Bell,
  CheckSquare,
  Pill,
  Droplets,
  Utensils,
  Footprints,
  Calendar,
  Brain,
  Volume2,
  VolumeX,
  Sparkles,
  Music,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Reminder, REMINDER_TUNES } from '../../types';
import { reminderAudio } from '../../utils/reminderAudio';
import { useAccessibility } from '../../context/AccessibilityContext';

interface AddReminderTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminderData: Omit<Reminder, '_id' | 'createdAt'>) => Promise<void>;
  patientId: string;
}

const QUICK_PRESETS = [
  {
    title: 'Drink Fresh Glass of Water',
    category: 'hydration' as const,
    time: '10:30',
    notes: 'Keep the cozy blue mug filled.',
    recurrence: 'Daily',
  },
  {
    title: 'Afternoon Prescription Medication',
    category: 'medication' as const,
    time: '14:00',
    notes: 'Take with full glass of water after food.',
    recurrence: 'Daily',
  },
  {
    title: '15-Minute Garden & Fresh Air Walk',
    category: 'activity' as const,
    time: '15:30',
    notes: 'Step outside into the sunshine and breathe deeply.',
    recurrence: 'Daily',
  },
  {
    title: 'Daily Memory Game Stimulation',
    category: 'routine' as const,
    time: '11:00',
    notes: 'Play 5 minutes of calming picture recall puzzles.',
    recurrence: 'Daily',
  },
  {
    title: 'Phone Call with Daughter Sarah',
    category: 'appointment' as const,
    time: '17:00',
    notes: 'Catch up on the week and say hello to Leo.',
    recurrence: 'Daily',
  },
  {
    title: 'Water Indoor Garden Plants',
    category: 'task' as const,
    time: '09:30',
    notes: 'Gentle water for the African violets on the sill.',
    recurrence: 'Daily',
  },
];

const TIME_PRESETS = [
  { label: 'Morning (8:30 AM)', value: '08:30' },
  { label: 'Mid-Morning (10:30 AM)', value: '10:30' },
  { label: 'Lunch (12:30 PM)', value: '12:30' },
  { label: 'Afternoon (3:00 PM)', value: '15:00' },
  { label: 'Dinner (6:00 PM)', value: '18:00' },
  { label: 'Evening (8:30 PM)', value: '20:30' },
];

export const AddReminderTaskModal: React.FC<AddReminderTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientId,
}) => {
  const { speakText, fontSize } = useAccessibility();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Reminder['category']>('task');
  const [time, setTime] = useState('09:00');
  const [recurrence, setRecurrence] = useState('Daily');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundTune, setSoundTune] = useState<string>('morning-bells');

  const [isSongPreviewing, setIsSongPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = reminderAudio.subscribe((playing) => {
      setIsSongPreviewing(playing);
    });
    return () => {
      unsub();
      reminderAudio.stop();
    };
  }, []);

  if (!isOpen) return null;

  const handleApplyPreset = (p: typeof QUICK_PRESETS[0]) => {
    setTitle(p.title);
    setCategory(p.category);
    setTime(p.time);
    setNotes(p.notes);
    setRecurrence(p.recurrence);
    speakText(`Applied preset: ${p.title}`);
  };

  const handleTogglePreviewSong = (tuneId = soundTune) => {
    if (isSongPreviewing) {
      reminderAudio.stop();
    } else {
      reminderAudio.previewTune(tuneId);
      const chosen = REMINDER_TUNES.find((t) => t.id === tuneId);
      speakText(`Previewing ${chosen?.name || 'reminder melody'}.`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError('Please enter a title for this schedule task or reminder.');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        patientId,
        title: cleanTitle,
        category,
        time,
        recurrence,
        priority,
        notes,
        description: notes,
        completed: false,
        soundEnabled,
        soundTune,
      });
      reminderAudio.playGentleChime();
      speakText(`Successfully added ${cleanTitle} to your schedule.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      id="add-task-modal-overlay"
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="add-task-modal-card"
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-8 space-y-6 shadow-2xl border border-slate-200 my-auto animate-fade-in max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-800 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Blended Task & Reminder</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Add Schedule Task / Reminder
            </h2>
            <p className="text-slate-500 text-sm">
              Schedule routines, medication times, chores, or appointments with an auditory melody.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              reminderAudio.stop();
              onClose();
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick 1-Tap Suggestions */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
            ⚡ Quick Senior Task Presets (Tap to Fill):
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 text-slate-700 hover:text-teal-900 text-xs font-bold transition-all shadow-2xs hover:border-teal-300 cursor-pointer"
              >
                + {preset.title}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 1. Title */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
              1. Task or Reminder Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon Water & Vitamin, Garden Walk, Call Sarah"
              className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden min-h-[50px]"
            />
          </div>

          {/* 2. Category Picker */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-2">
              2. Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'task', label: 'Task / Chore', icon: CheckSquare, color: 'teal' },
                { id: 'medication', label: 'Medication', icon: Pill, color: 'rose' },
                { id: 'hydration', label: 'Hydration', icon: Droplets, color: 'blue' },
                { id: 'meal', label: 'Meal & Nutrition', icon: Utensils, color: 'amber' },
                { id: 'activity', label: 'Walk & Exercise', icon: Footprints, color: 'emerald' },
                { id: 'routine', label: 'Brain Exercise', icon: Brain, color: 'purple' },
                { id: 'appointment', label: 'Appointment / Call', icon: Calendar, color: 'indigo' },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as any)}
                    className={`p-3 rounded-2xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50 border-teal-600 text-teal-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                    <span className="text-xs font-bold leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Time Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-extrabold text-slate-800">
                3. Scheduled Time
              </label>
              <span className="text-xs text-slate-500">24-hour format: {time}</span>
            </div>

            {/* Quick time chips */}
            <div className="flex flex-wrap gap-1.5 pb-1">
              {TIME_PRESETS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTime(t.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    time === t.value
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Clock className="w-5 h-5 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-base text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 4. Recurrence & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                4. Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-teal-600 focus:outline-hidden cursor-pointer"
              >
                <option value="Daily">Daily (Every Day)</option>
                <option value="Once">Once Today</option>
                <option value="Weekdays">Weekdays (Mon - Fri)</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
                5. Importance / Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm font-bold text-slate-800 focus:bg-white focus:border-teal-600 focus:outline-hidden cursor-pointer"
              >
                <option value="normal">Normal (Gentle Routine)</option>
                <option value="high">High (Important Time)</option>
                <option value="urgent">Urgent (Essential Medication)</option>
              </select>
            </div>
          </div>

          {/* 5. Melodic Song Reminder Feature */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Remind with Calming Song
                  </h4>
                  <p className="text-xs text-slate-600">
                    Plays a gentle, peaceful bell melody when this task is due.
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-12 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
              </label>
            </div>

            {soundEnabled && (
              <div className="pt-2 border-t border-amber-200/60 space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-900">
                  Select Melody / Song:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REMINDER_TUNES.map((tune) => {
                    const isSelected = soundTune === tune.id;
                    return (
                      <div
                        key={tune.id}
                        onClick={() => setSoundTune(tune.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-400'
                            : 'bg-white/60 hover:bg-white border-amber-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-lg">{tune.icon}</span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {tune.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {tune.description}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreviewSong(tune.id);
                          }}
                          className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 shrink-0 transition-colors"
                          title={`Preview ${tune.name}`}
                          aria-label={`Preview ${tune.name}`}
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 6. Notes / Description */}
          <div>
            <label className="block text-sm font-extrabold text-slate-800 mb-1.5">
              6. Care Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Take with warm chamomile tea, daughter will assist, wear walking shoes..."
              className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm text-slate-900 focus:bg-white focus:border-teal-600 focus:outline-hidden"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                reminderAudio.stop();
                onClose();
              }}
              className="px-5 py-3 rounded-2xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 cursor-pointer min-h-[48px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2 min-h-[48px]"
            >
              {saving ? (
                <span>Saving to Schedule...</span>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>Save to Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
