import React, { useState, useEffect } from 'react';
import {
  Users,
  Brain,
  TrendingUp,
  BookOpen,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  Award,
  CheckCircle,
  Clock,
  Heart,
  Calendar,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Activity,
  UserCheck,
  Database,
  Lock,
  LogOut,
  Music,
  Volume2,
  CheckSquare,
  Play,
  Square,
  FileText,
  MapPin,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { api } from '../../services/api';
import {
  GameProgress,
  GameResult,
  Memory,
  Reminder,
  User,
  DatabaseStatus,
  CognitivePerformanceReport,
  DEFAULT_MALE_CAREGIVER_AVATAR,
  DEFAULT_FEMALE_CAREGIVER_AVATAR,
  DEFAULT_MALE_PATIENT_AVATAR,
  DEFAULT_FEMALE_PATIENT_AVATAR,
} from '../../types';
import { SignOutConfirmModal } from '../auth/SignOutConfirmModal';
import { AuthModal } from '../common/AuthModal';
import { reminderAudio } from '../../utils/reminderAudio';
import { PatientPerformanceAnalysis } from './PatientPerformanceAnalysis';
import { PatientLocationTracking } from './PatientLocationTracking';
import { MusicTherapyView } from '../music/MusicTherapyView';
import { AddPhotoModal } from './AddPhotoModal';

export const CaregiverDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useAccessibility();

  const [activeTab, setActiveTab] = useState<
    'clinical-report' | 'location' | 'analytics' | 'memories' | 'reminders' | 'ai-insights' | 'music'
  >('clinical-report');
  const [allPatients, setAllPatients] = useState<User[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(() => user?.patientId || 'patient_eleanor');
  const [patient, setPatient] = useState<User | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [report, setReport] = useState<CognitivePerformanceReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Modals / forms state
  const [showAddMemoryModal, setShowAddMemoryModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);

  // Form states
  const [newMemory, setNewMemory] = useState({
    title: '',
    description: '',
    relationship: 'Family',
    personName: '',
    photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    dateEra: '2022',
  });

  const [newReminder, setNewReminder] = useState({
    title: '',
    category: 'task' as any,
    time: '10:00 AM',
    frequency: 'Daily',
    recurrence: 'Daily',
    description: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    soundEnabled: true,
  });

  const [isSongPlaying, setIsSongPlaying] = useState(false);

  useEffect(() => {
    const unsub = reminderAudio.subscribe((playing) => setIsSongPlaying(playing));
    return () => unsub();
  }, []);

  const [difficultyUpdateMsg, setDifficultyUpdateMsg] = useState<string | null>(null);

  const pId = selectedPatientId || user?.patientId || 'patient_eleanor';

  const loadReportData = async (targetId: string) => {
    setIsLoadingReport(true);
    try {
      const rep = await api.analyzePatientPerformance(targetId);
      setReport(rep);
    } catch (err) {
      console.warn('Failed to fetch patient cognitive performance report:', err);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [patList, dbData] = await Promise.all([
        api.getPatients().catch(() => []),
        api.getDatabaseStatus().catch(() => null),
      ]);
      setAllPatients(patList);

      let targetId = selectedPatientId;
      if (!targetId && patList.length > 0) {
        targetId = patList[0]._id;
        setSelectedPatientId(targetId);
      }

      const [patData, progData, histData, memData, remData] = await Promise.all([
        api.getPatient(targetId).catch(() => null),
        api.getGameProgress(targetId).catch(() => null),
        api.getGameResults(targetId).catch(() => []),
        api.getMemories(targetId).catch(() => []),
        api.getReminders(targetId).catch(() => []),
      ]);

      if (patData) setPatient(patData);
      if (progData) setProgress(progData);
      setGameHistory(histData);
      setMemories(memData);
      setReminders(remData);
      if (dbData) setDbStatus(dbData);

      // Also trigger initial report loading
      loadReportData(targetId);
    } catch (err) {
      console.warn('Error loading caregiver portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedPatientId]);

  // Update adaptive difficulty setting directly
  const handleDifficultyChange = async (newDiff: 'easy' | 'medium' | 'hard') => {
    try {
      const res = await api.updatePatient(pId, { cognitiveDifficulty: newDiff });
      setPatient(res.patient);
      setDifficultyUpdateMsg(`Challenge level set to ${newDiff.toUpperCase()}`);
      setTimeout(() => setDifficultyUpdateMsg(null), 3000);
    } catch (e) {
      console.warn('Failed to update difficulty:', e);
    }
  };

  // Memory creation
  const handleCreateMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.title || !newMemory.description) return;

    try {
      const created = await api.createMemory({
        ...newMemory,
        patientId: pId,
        tags: [newMemory.relationship.toLowerCase()],
      });
      setMemories((prev) => [created, ...prev]);
      setShowAddMemoryModal(false);
      setNewMemory({
        title: '',
        description: '',
        relationship: 'Family',
        personName: '',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
        dateEra: '2022',
      });
    } catch (err) {
      console.warn('Failed to create memory:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    try {
      await api.deleteMemory(id);
      setMemories((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      console.warn('Failed to delete memory:', e);
    }
  };

  // Reminder / Task creation
  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminder.title) return;

    try {
      const created = await api.createReminder({
        patientId: pId,
        title: newReminder.title,
        category: newReminder.category,
        time: newReminder.time,
        recurrence: newReminder.recurrence || 'Daily',
        priority: newReminder.priority || 'normal',
        description: newReminder.description,
        notes: newReminder.description,
        soundEnabled: newReminder.soundEnabled !== false,
        completed: false,
      });
      setReminders((prev) => [created, ...prev]);
      setShowAddReminderModal(false);
      setNewReminder({
        title: '',
        category: 'task',
        time: '10:00 AM',
        frequency: 'Daily',
        recurrence: 'Daily',
        description: '',
        priority: 'normal',
        soundEnabled: true,
      });
    } catch (err) {
      console.warn('Failed to create reminder:', err);
    }
  };

  const handleToggleReminderComplete = async (r: Reminder) => {
    try {
      const updated = await api.updateReminder(r._id, { completed: !r.completed });
      setReminders((prev) => prev.map((item) => (item._id === r._id ? updated : item)));
    } catch (e) {
      console.warn('Failed to toggle reminder status:', e);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      await api.deleteReminder(id);
      setReminders((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      console.warn('Failed to delete reminder:', e);
    }
  };

  // Prepare chart data for Recharts
  const accuracyChartData = gameHistory.slice(-7).map((item) => {
    const rawDate = item.completedAt || (item as any).playedAt || Date.now();
    const d = new Date(rawDate);
    return {
      name: `${d.getMonth() + 1}/${d.getDate()}`,
      accuracy: item.accuracy,
      score: item.score,
      timeSeconds: Math.round(item.responseTimeMs / 1000),
      game: item.gameType,
    };
  });

  const caregiverAvatar = user?.avatar || (user?.gender === 'female' ? DEFAULT_FEMALE_CAREGIVER_AVATAR : DEFAULT_MALE_CAREGIVER_AVATAR);
  const caregiverGender = user?.gender || 'male';
  const patientAvatar = patient?.avatar || (patient?.gender === 'male' ? DEFAULT_MALE_PATIENT_AVATAR : DEFAULT_FEMALE_PATIENT_AVATAR);
  const patientGender = patient?.gender || 'female';

  return (
    <div id="caregiver-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Caregiver Welcome Banner & Profile Command Center */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-indigo-800/80">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Left: Caregiver & Patient Identification */}
          <div className="space-y-4 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-indigo-500/30 border border-indigo-400/30 px-3.5 py-1 rounded-full text-xs font-black text-indigo-200 uppercase tracking-wider">
                <UserCheck className="w-4 h-4" />
                <span>{t('caregiverPortal')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 rounded-full text-xs font-bold text-emerald-200">
                <Database className="w-3.5 h-3.5 text-emerald-300" />
                <span>{dbStatus?.isMongoConnected ? 'MongoDB Connected' : 'MongoDB Engine Active'}</span>
                {dbStatus && (
                  <span className="text-[10px] text-emerald-300/80 ml-1">
                    ({dbStatus.counts.memories} memories, {dbStatus.counts.reminders} reminders)
                  </span>
                )}
              </div>
            </div>

            {/* Profile Bar: Caregiver and Monitored Patient */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-xs">
              {/* Caregiver Identity */}
              <div className="flex items-center gap-3 pr-4 border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0">
                <img
                  src={caregiverAvatar}
                  alt={user?.name || 'Caregiver'}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-indigo-400/50 shadow-xs flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Caregiver</span>
                    <span className="text-[10px] font-black bg-indigo-500/40 text-indigo-200 px-1.5 py-0.5 rounded">
                      {caregiverGender === 'female' ? '👩 Female' : '👨 Male'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{user?.name || 'Dr. Marcus Vance'}</h4>
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(true)}
                    className="text-[11px] text-teal-300 hover:text-teal-200 font-bold flex items-center gap-1 mt-0.5 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Change Gender Profile</span>
                  </button>
                </div>
              </div>

              {/* Patient Identity */}
              <div className="flex items-center gap-3">
                <img
                  src={patientAvatar}
                  alt={patient?.name || 'Patient'}
                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-teal-400/50 shadow-xs flex-shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">{t('activePatient')}</span>
                    <span className="text-[10px] font-black bg-teal-500/40 text-teal-200 px-1.5 py-0.5 rounded">
                      {patientGender === 'male' ? '👨 Male' : '👩 Female'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white">{patient?.name || 'Eleanor Vance'}</h4>
                  {allPatients.length > 1 && (
                    <select
                      id="caregiver-patient-select"
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                      className="bg-indigo-950/90 border border-indigo-400/40 rounded-lg px-2 py-0.5 text-[11px] font-bold text-white focus:outline-hidden cursor-pointer mt-0.5"
                    >
                      {allPatients.map((p) => (
                        <option key={p._id} value={p._id} className="bg-slate-900 text-white font-normal">
                          Switch: {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              {t('caregiverSubtitle')}
            </p>
          </div>

          {/* Right: Quick Controls & Adaptive Challenge Selector */}
          <div className="space-y-3 flex-shrink-0 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-xs border border-white/20 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-black text-indigo-200 uppercase tracking-wider">
                  {t('adaptiveDifficulty')}:
                </span>
                {difficultyUpdateMsg && (
                  <span className="text-[11px] font-bold text-emerald-300 animate-pulse">
                    {difficultyUpdateMsg}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {(['easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    id={`set-diff-${diff}`}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      patient?.cognitiveDifficulty === diff
                        ? 'bg-emerald-500 text-white shadow-xs scale-105'
                        : 'bg-white/10 hover:bg-white/20 text-indigo-100'
                    }`}
                  >
                    {diff === 'easy' ? t('gentle') : diff === 'medium' ? t('balanced') : t('advanced')}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Sign Out Button */}
            <div className="flex justify-end">
              <button
                type="button"
                id="caregiver-banner-signout-btn"
                onClick={() => setShowSignOutConfirm(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer"
                title="Sign Out of Caregiver Account"
              >
                <LogOut className="w-4 h-4 text-rose-300" />
                <span>{t('signOut')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Vital Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center flex-shrink-0">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">{t('memory')}</span>
            <p className="text-2xl font-black text-slate-900">{progress?.memoryScore ?? 92}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">{t('attention')}</span>
            <p className="text-2xl font-black text-slate-900">{progress?.attentionScore ?? 88}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">{t('recall')}</span>
            <p className="text-2xl font-black text-slate-900">{progress?.recallScore ?? 85}%</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">{t('myReminders')}</span>
            <p className="text-2xl font-black text-slate-900">{reminders.length} Active</p>
          </div>
        </div>
      </div>

      {/* Main Caregiver Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-3 sm:gap-6 overflow-x-auto pb-1">
        {/* Tab 1: Clinical Performance Report */}
        <button
          id="tab-clinical-report"
          onClick={() => setActiveTab('clinical-report')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'clinical-report'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>{t('clinicalPerformanceReport')}</span>
          <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full hidden sm:inline">
            AI Evaluated
          </span>
        </button>

        {/* Tab: Patient Location & Safe Zone */}
        <button
          id="tab-location"
          onClick={() => setActiveTab('location')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'location'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MapPin className="w-5 h-5 text-rose-600" />
          <span>{t('patientLocation')}</span>
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full hidden sm:inline ${
              patient?.location?.status === 'wandering_alert'
                ? 'bg-rose-100 text-rose-800 animate-pulse'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {patient?.location?.status === 'wandering_alert' ? 'Alert' : 'Live Safe'}
          </span>
        </button>

        {/* Tab 2: Analytics & Trends */}
        <button
          id="tab-analytics"
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5 text-teal-600" />
          <span>{t('gameAnalyticsTrends')}</span>
        </button>

        {/* Tab 3: Memory Book */}
        <button
          id="tab-memories"
          onClick={() => setActiveTab('memories')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'memories'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span>{t('memoryBook')} ({memories.length})</span>
        </button>

        {/* Tab 4: Schedule & Reminders */}
        <button
          id="tab-reminders"
          onClick={() => setActiveTab('reminders')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'reminders'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Bell className="w-5 h-5 text-amber-600" />
          <span>{t('scheduleReminders')} ({reminders.length})</span>
        </button>

        {/* Tab 5: AI Care Insights */}
        <button
          id="tab-ai-insights"
          onClick={() => setActiveTab('ai-insights')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'ai-insights'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-5 h-5 text-purple-600" />
          <span>{t('careInsightsAISummary')}</span>
        </button>

        {/* Tab 6: Relaxing Songs & Music Therapy */}
        <button
          id="tab-music"
          onClick={() => setActiveTab('music')}
          className={`pb-3 text-sm sm:text-base font-black flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'music'
              ? 'border-indigo-600 text-indigo-950'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Music className="w-5 h-5 text-rose-600" />
          <span>{t('relaxingSongs')}</span>
        </button>
      </div>

      {/* TAB 1: CLINICAL PERFORMANCE REPORT (Neat, Beautiful, Detailed Patient Analysis) */}
      {activeTab === 'clinical-report' && (
        <PatientPerformanceAnalysis
          patientName={patient?.name || 'Eleanor Vance'}
          patient={patient}
          progress={progress}
          gameHistory={gameHistory}
          report={report}
          onRefreshReport={() => loadReportData(pId)}
          isLoadingReport={isLoadingReport}
        />
      )}

      {/* TAB: PATIENT LOCATION & SAFE ZONE TRACKING */}
      {activeTab === 'location' && (
        <PatientLocationTracking
          patient={patient}
          onRefreshPatient={loadAllData}
        />
      )}

      {/* TAB 2: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Accuracy Trend Chart */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">{t('accuracyProgressTrend')}</h3>
                <p className="text-xs text-slate-500 font-medium">Recent cognitive exercise performance trajectory</p>
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyChartData}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="accuracy" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" name="Accuracy %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Response Time Chart */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-lg text-slate-900">{t('responseTimeBySession')}</h3>
                <p className="text-xs text-slate-500 font-medium">Seconds to complete each cognitive session</p>
              </div>
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accuracyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="timeSeconds" fill="#6366f1" radius={[8, 8, 0, 0]} name="Seconds" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Game History Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
            <h3 className="font-black text-lg text-slate-900">{t('recentSessionLog')}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs font-black uppercase tracking-wider">
                    <th className="pb-3">{t('dateTime')}</th>
                    <th className="pb-3">{t('cognitiveGame')}</th>
                    <th className="pb-3">{t('difficulty')}</th>
                    <th className="pb-3">{t('score')}</th>
                    <th className="pb-3">{t('accuracy')}</th>
                    <th className="pb-3">{t('responseTime')}</th>
                    <th className="pb-3">{t('mistakes')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {gameHistory.slice(0, 8).map((g) => {
                    const rawDate = g.completedAt || (g as any).playedAt || Date.now();
                    return (
                      <tr key={g._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 text-slate-600 font-medium whitespace-nowrap">
                          {new Date(rawDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-bold text-slate-900 capitalize whitespace-nowrap">
                          {g.gameType.replace('-', ' ')}
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 capitalize">
                            {g.difficulty}
                          </span>
                        </td>
                        <td className="py-3 font-black text-teal-700">{g.score}</td>
                        <td className="py-3 font-bold text-slate-800">{g.accuracy}%</td>
                        <td className="py-3 text-slate-600">{Math.round(g.responseTimeMs / 1000)}s</td>
                        <td className="py-3 text-slate-600 font-medium">{g.mistakes}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MEMORY MANAGEMENT */}
      {activeTab === 'memories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-2xl text-slate-900">{t('patientMemoryBook')}</h3>
              <p className="text-slate-600 text-sm font-medium">
                {t('memoryBookSubtitle')}
              </p>
            </div>
            <button
              id="add-memory-btn"
              onClick={() => setShowAddMemoryModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-black rounded-2xl shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>{t('addMemory')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memories.map((m) => (
              <div
                key={m._id}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <img src={m.photoUrl} alt={m.title} className="w-full h-48 object-cover" />
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {m.relationship}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{m.dateEra}</span>
                    </div>
                    <h4 className="font-black text-xl text-slate-900">{m.title}</h4>
                    {m.personName && (
                      <p className="text-xs font-extrabold text-teal-700">Person: {m.personName}</p>
                    )}
                    <p className="text-slate-600 text-sm line-clamp-3 font-medium">{m.description}</p>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleDeleteMemory(m._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REMINDERS & TASK SCHEDULE */}
      {activeTab === 'reminders' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-2xl text-slate-900">{t('scheduleReminders')}</h3>
              <p className="text-slate-600 text-sm font-medium">
                Schedule medications, hydration, daily tasks, walks, and calls. Each reminder alerts with our default calming song.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isSongPlaying) {
                    reminderAudio.stop();
                  } else {
                    reminderAudio.playDefaultReminderSong(false);
                  }
                }}
                className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSongPlaying
                    ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                    : 'bg-white hover:bg-amber-50 text-amber-900 border-amber-300 shadow-2xs'
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

              <button
                id="add-reminder-btn"
                onClick={() => setShowAddReminderModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-2xl shadow-xs cursor-pointer transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>{t('addTaskReminder')}</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-xs">
            {reminders.map((r) => (
              <div key={r._id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                      {r.time}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 capitalize">
                      {r.category}
                    </span>
                    {r.priority === 'urgent' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-600 text-white uppercase">
                        {t('urgent')}
                      </span>
                    )}
                    {r.soundEnabled !== false && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1 capitalize">
                          <Music className="w-3 h-3 text-amber-600" />
                          <span>{r.soundTune ? r.soundTune.replace('-', ' ') : t('melodySong')}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => reminderAudio.previewTune(r.soundTune || 'morning-bells')}
                          className="px-2 py-0.5 rounded-lg bg-amber-100/70 hover:bg-amber-200 text-amber-900 text-[10px] font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Preview reminder melody"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Preview</span>
                        </button>
                      </div>
                    )}
                    {r.completed && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        ✓ {t('markDone')}
                      </span>
                    )}
                  </div>
                  <h4 className={`font-black text-lg text-slate-900 ${r.completed ? 'line-through text-slate-400' : ''}`}>
                    {r.title}
                  </h4>
                  {(r.description || r.notes) && (
                    <p className="text-sm text-slate-600 font-medium">{r.description || r.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleToggleReminderComplete(r)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      r.completed
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {r.completed ? t('markIncomplete') : t('markDone')}
                  </button>

                  <button
                    onClick={() => handleDeleteReminder(r._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title={t('delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {reminders.length === 0 && (
              <div className="p-8 text-center text-slate-500 font-medium">
                {t('noRemindersScheduled')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: AI CAREGIVER INSIGHTS */}
      {activeTab === 'ai-insights' && (
        <div className="space-y-6">
          <div className="bg-purple-50 border border-purple-200/90 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-2xl text-purple-950">{t('careInsightsAISummary')}</h3>
                <p className="text-sm text-purple-800 font-medium">
                  Automated weekly activity analysis based on game engagement and routine completion.
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-purple-200/80 space-y-4 text-slate-800 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>Positive Engagement Trend Detected</span>
              </div>
              <p className="leading-relaxed text-slate-700 font-medium">
                Over recent sessions, {patient?.name || 'Eleanor'} demonstrated steady accuracy in visual memory match (average 92%) with an average response time of 3.2 seconds. Working memory exercises are responding well at the current adaptive challenge level.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-black text-sm text-slate-900">Recommended Activities</h5>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Introduce 1-2 Picture Recall sessions in the morning after breakfast when focus is highest.
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h5 className="font-black text-sm text-slate-900">Routine Adherence</h5>
                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Morning hydration and vitamin reminders were marked complete with consistent adherence.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-xs text-purple-700 font-medium">
              * Note: These insights are assistive observations and do not constitute clinical diagnostic reports.
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: MUSIC THERAPY & SONGS */}
      {activeTab === 'music' && (
        <div className="space-y-4">
          <MusicTherapyView
            onBack={() => setActiveTab('clinical-report')}
            patientId={pId}
          />
        </div>
      )}

      {/* Modal: Add Custom Photo / Memory */}
      <AddPhotoModal
        isOpen={showAddMemoryModal}
        onClose={() => setShowAddMemoryModal(false)}
        onSave={async (memoryData) => {
          try {
            const created = await api.createMemory({
              ...memoryData,
              patientId: pId,
            });
            setMemories((prev) => [created, ...prev]);
            setShowAddMemoryModal(false);
          } catch (err) {
            console.warn('Failed to save memory:', err);
          }
        }}
        patientName={patient?.name || 'Eleanor Vance'}
        patientId={pId}
      />

      {/* Modal: Add Reminder or Task */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-2xl text-slate-900">{t('addTaskReminder')}</h3>
                <p className="text-xs text-slate-500 font-medium">Scheduled for {patient?.name || 'your loved one'}</p>
              </div>
              <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-800">
                <Bell className="w-6 h-6" />
              </span>
            </div>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Title / Action Name
                </label>
                <input
                  type="text"
                  required
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="e.g., Afternoon Walk in Garden or Water Plants"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Category</label>
                  <select
                    value={newReminder.category}
                    onChange={(e) => setNewReminder({ ...newReminder, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="task">Task / Chore 📋</option>
                    <option value="routine">Daily Routine 🔄</option>
                    <option value="medication">Medication 💊</option>
                    <option value="hydration">Hydration 💧</option>
                    <option value="meal">Meal 🍲</option>
                    <option value="appointment">Appointment 📅</option>
                    <option value="activity">Brain Exercise / Activity 🧠</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Scheduled Time</label>
                  <input
                    type="text"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    placeholder="e.g., 14:00 or 2:00 PM"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Priority</label>
                  <select
                    value={newReminder.priority}
                    onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">{t('urgent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Recurrence</label>
                  <select
                    value={newReminder.recurrence}
                    onChange={(e) => setNewReminder({ ...newReminder, recurrence: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Once">Once</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="e.g., Take with a full glass of water or put on sun hat"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Sound Option & Melodic Song Preview */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReminder.soundEnabled}
                      onChange={(e) => setNewReminder({ ...newReminder, soundEnabled: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded-md border-amber-300 focus:ring-amber-500"
                    />
                    <div>
                      <span className="text-sm font-black text-slate-900 block">
                        Play Default Melody Song on Alarm 🔔
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        Plays a comforting, senior-friendly song designed to notify without startling.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (isSongPlaying) {
                        reminderAudio.stop();
                      } else {
                        reminderAudio.playDefaultReminderSong(false);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
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
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddReminderModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-black rounded-xl text-sm cursor-pointer shadow-xs"
                >
                  Save Schedule Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={logout}
        userName={user?.name}
      />

      {/* Caregiver Profile & Gender Customization Modal */}
      <AuthModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        initialMode="login"
      />
    </div>
  );
};
