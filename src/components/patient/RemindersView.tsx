import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  Clock,
  Pill,
  Droplets,
  Utensils,
  Calendar,
  Sparkles,
  Plus,
  Music,
  Trash2,
  CheckSquare,
  Footprints,
  Brain,
  AlertCircle,
  PhoneCall,
  Sliders,
  Play,
  Square,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import { Reminder } from '../../types';
import { reminderAudio } from '../../utils/reminderAudio';
import { ReminderAlarmModal } from '../reminders/ReminderAlarmModal';
import { AddReminderTaskModal } from '../reminders/AddReminderTaskModal';

interface RemindersViewProps {
  onBack: () => void;
}

export const RemindersView: React.FC<RemindersViewProps> = ({ onBack }) => {
  const { user } = useAuth();
  const { speakText, fontSize, highContrast } = useAccessibility();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    'all' | 'task' | 'medication' | 'hydration' | 'activity' | 'completed'
  >('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeAlarmReminder, setActiveAlarmReminder] = useState<Reminder | null>(null);

  // Audio preview state
  const [isSongPlaying, setIsSongPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(() => reminderAudio.isMuted());
  const [currentTimeStr, setCurrentTimeStr] = useState('');

  // Keep track of reminders that already alarmed in this session to prevent repeated triggers in the same minute
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  const fetchReminders = async () => {
    try {
      const data = await api.getReminders(user?._id || 'patient_eleanor');
      setReminders(data);
    } catch (e) {
      console.warn('Failed to load reminders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  // Subscribe to audio engine changes
  useEffect(() => {
    const unsub = reminderAudio.subscribe((playing) => {
      setIsSongPlaying(playing);
    });
    return () => unsub();
  }, []);

  // Real-time clock and automatic reminder alarm triggering by matching HH:MM
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const nowTime = `${hours}:${minutes}`;
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      // Find any uncompleted task scheduled for this minute that hasn't fired yet
      reminders.forEach((r) => {
        if (!r.completed && r.time) {
          // Normalize time string: if stored as "08:30" or "8:30" or "14:00"
          const normalizedTaskTime = r.time.replace(/\s*[AP]M/i, '').trim();
          const taskParts = normalizedTaskTime.split(':');
          if (taskParts.length === 2) {
            const formattedTaskTime = `${taskParts[0].padStart(2, '0')}:${taskParts[1].padStart(2, '0')}`;
            const key = `${r._id}_${nowTime}`;

            if (formattedTaskTime === nowTime && !triggeredAlarmsRef.current.has(key)) {
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
    const interval = setInterval(checkAlarms, 10000); // check every 10s
    return () => clearInterval(interval);
  }, [reminders]);

  const handleToggleComplete = async (reminder: Reminder) => {
    const newStatus = !reminder.completed;
    try {
      const updated = await api.updateReminder(reminder._id, { completed: newStatus });
      setReminders((prev) => prev.map((r) => (r._id === reminder._id ? updated : r)));

      if (newStatus) {
        reminderAudio.playGentleChime();
        speakText(`Splendid! You completed ${reminder.title}.`);
      }
    } catch (e) {
      console.warn('Failed to toggle reminder status:', e);
    }
  };

  const handleDeleteReminder = async (id: string, title: string) => {
    try {
      await api.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
      speakText(`Removed ${title} from schedule.`);
    } catch (e) {
      console.warn('Failed to delete reminder:', e);
    }
  };

  const handleSaveNewReminder = async (newReminderData: Omit<Reminder, '_id' | 'createdAt'>) => {
    const created = await api.createReminder(newReminderData);
    setReminders((prev) => [...prev, created]);
  };

  const handleManualTriggerAlarm = (reminder: Reminder) => {
    setActiveAlarmReminder(reminder);
  };

  const handleAlarmComplete = async (reminder: Reminder) => {
    setActiveAlarmReminder(null);
    await handleToggleComplete(reminder);
  };

  const handleAlarmSnooze = async (reminder: Reminder) => {
    setActiveAlarmReminder(null);
    // Add 5 minutes to time
    const [h, m] = reminder.time.split(':').map((v) => parseInt(v, 10) || 0);
    const newMin = (m + 5) % 60;
    const newHour = m + 5 >= 60 ? (h + 1) % 24 : h;
    const newTimeStr = `${String(newHour).padStart(2, '0')}:${String(newMin).padStart(2, '0')}`;

    try {
      const updated = await api.updateReminder(reminder._id, { time: newTimeStr });
      setReminders((prev) => prev.map((r) => (r._id === reminder._id ? updated : r)));
      speakText(`Snoozed ${reminder.title} for 5 minutes until ${newTimeStr}.`);
    } catch (e) {
      console.warn('Failed to snooze reminder:', e);
    }
  };

  const handleToggleDefaultSongPreview = () => {
    if (isSongPlaying) {
      reminderAudio.stop();
    } else {
      reminderAudio.playDefaultReminderSong(false);
      speakText('Playing the peaceful default reminder song.');
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    reminderAudio.setMuted(next);
  };

  const handleReadSchedule = () => {
    const pending = reminders.filter((r) => !r.completed);
    if (pending.length === 0) {
      speakText('Splendid news! All your scheduled tasks and reminders for today are completed.');
      return;
    }
    const text =
      `You have ${pending.length} scheduled task${pending.length === 1 ? '' : 's'} remaining: ` +
      pending.map((r) => `${r.title} at ${r.time}`).join('. ');
    speakText(text);
  };

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return r.completed;
    if (filter === 'task') return r.category === 'task' || r.category === 'routine';
    return r.category === filter;
  });

  const completedCount = reminders.filter((r) => r.completed).length;
  const totalCount = reminders.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'medication':
        return <Pill className="w-5 h-5 text-rose-600" />;
      case 'hydration':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'meal':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'activity':
        return <Footprints className="w-5 h-5 text-emerald-600" />;
      case 'routine':
        return <Brain className="w-5 h-5 text-purple-600" />;
      case 'appointment':
        return <Calendar className="w-5 h-5 text-indigo-600" />;
      case 'task':
      default:
        return <CheckSquare className="w-5 h-5 text-teal-600" />;
    }
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'medication':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'hydration':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meal':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'activity':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'routine':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'appointment':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-teal-100 text-teal-800 border-teal-200';
    }
  };

  return (
    <div id="reminders-schedule-view" className="max-w-5xl mx-auto space-y-6 py-4 px-2 sm:px-0">
      {/* Top Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          id="reminders-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-xs cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Read Schedule Button */}
          <button
            id="read-schedule-btn"
            onClick={handleReadSchedule}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-sm font-bold cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-700" />
            <span className="hidden sm:inline">Read Schedule Aloud</span>
            <span className="sm:hidden">Read Aloud</span>
          </button>

          {/* Add Task / Reminder Button */}
          <button
            id="open-add-task-modal-btn"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white text-sm font-black shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            <span>Add Task / Reminder</span>
          </button>
        </div>
      </div>

      {/* Hero Banner: Blended Schedule & Melodic Song Center */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-amber-200 uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              <span>Current Time: {currentTimeStr || 'Ready'}</span>
            </div>
            <h1
              id="reminders-title"
              className={`font-black tracking-tight ${
                fontSize === 'extra-large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              Daily Schedule & Melodic Reminders
            </h1>
            <p className="text-amber-100/90 text-sm sm:text-base leading-relaxed">
              Seamlessly blend your daily tasks, chores, and medication alarms. Each reminder sounds with
              our calming, senior-crafted default bell song.
            </p>
          </div>

          {/* Default Song Player Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 shrink-0 flex flex-col gap-3 min-w-[260px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-200">
                  Default Song Alert
                </span>
              </div>
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                  isMuted ? 'bg-rose-600 border-rose-400 text-white' : 'bg-white/20 border-white/30 text-white'
                }`}
                title={isMuted ? 'Audio Muted' : 'Audio Enabled'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-xs text-amber-100/80">
              Gentle harmonic lullaby chime to notify you comfortably.
            </p>

            <button
              id="preview-song-btn"
              type="button"
              onClick={handleToggleDefaultSongPreview}
              className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                isSongPlaying
                  ? 'bg-amber-400 text-amber-950 shadow-lg animate-pulse'
                  : 'bg-white text-slate-900 hover:bg-amber-100 shadow-xs'
              }`}
            >
              {isSongPlaying ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Song Playing</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Listen to Default Song 🎵</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Completion Progress Strip */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-extrabold text-slate-900">Today's Schedule Progress:</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {completedCount} of {totalCount} completed ({completionRate}%)
            </span>
          </div>
          <div className="w-full sm:w-72 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
          <span>Active automatic song alerts enabled</span>
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'task', label: 'Tasks & Chores' },
          { id: 'medication', label: 'Medications' },
          { id: 'hydration', label: 'Hydration' },
          { id: 'activity', label: 'Activities & Walks' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`filter-tab-${tab.id}`}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blended Schedule Tasks List */}
      <div className="space-y-3.5">
        {filteredReminders.map((reminder) => (
          <div
            key={reminder._id}
            id={`reminder-item-${reminder._id}`}
            className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              reminder.completed
                ? 'border-emerald-200 bg-emerald-50/25 opacity-75'
                : 'border-slate-200 hover:border-amber-300'
            }`}
          >
            {/* Left: Category Icon, Time, Title, Notes */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {getCategoryIcon(reminder.category)}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {reminder.time}
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getCategoryBadgeClass(
                      reminder.category
                    )}`}
                  >
                    {reminder.category}
                  </span>

                  {reminder.priority === 'urgent' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                      Urgent
                    </span>
                  )}

                  {reminder.soundEnabled !== false && (
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Music className="w-3 h-3 text-amber-600" />
                      <span>Melody Song</span>
                    </span>
                  )}

                  {reminder.completed && (
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      ✓ Completed
                    </span>
                  )}
                </div>

                <h3
                  className={`font-black text-lg sm:text-xl text-slate-900 ${
                    reminder.completed ? 'line-through text-slate-500' : ''
                  }`}
                >
                  {reminder.title}
                </h3>

                {(reminder.notes || reminder.description) && (
                  <p className="text-slate-600 text-xs sm:text-sm">
                    {reminder.notes || reminder.description}
                  </p>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
              {/* Trigger Song / Ring Alarm Test Button */}
              <button
                id={`ring-reminder-${reminder._id}`}
                type="button"
                onClick={() => handleManualTriggerAlarm(reminder)}
                className="px-3 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Ring Melodic Alarm"
              >
                <Bell className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Sound Alarm</span>
              </button>

              {/* Read text aloud */}
              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${reminder.title} scheduled for ${reminder.time}. ${
                      reminder.notes || reminder.description || ''
                    }`
                  )
                }
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                title="Read reminder aloud"
                aria-label={`Read ${reminder.title} aloud`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteReminder(reminder._id, reminder.title)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                title="Delete task"
                aria-label={`Delete ${reminder.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Toggle Completed */}
              <button
                id={`toggle-complete-${reminder._id}`}
                onClick={() => handleToggleComplete(reminder)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm shadow-xs transition-all cursor-pointer min-h-[44px] ${
                  reminder.completed
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md hover:scale-[1.02]'
                }`}
              >
                {reminder.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Mark Done</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {filteredReminders.length === 0 && (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
            <Sparkles className="w-9 h-9 text-amber-500 mx-auto" />
            <h4 className="font-extrabold text-lg text-slate-800">
              No schedule items found in this section
            </h4>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              You can tap "Add Task / Reminder" above to add new routines, medications, or chores.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-700 text-white text-sm font-bold shadow-xs hover:bg-teal-800 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Task / Reminder Modal */}
      <AddReminderTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewReminder}
        patientId={user?._id || 'patient_eleanor'}
      />

      {/* Active Melodic Alarm Modal */}
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
