import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  Activity,
  Award,
  Sparkles,
  CheckCircle,
  Clock,
  RefreshCw,
  Volume2,
  VolumeX,
  FileText,
  Printer,
  Check,
  Calendar,
  ShieldCheck,
  BarChart3,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { GameProgress, GameResult, CognitivePerformanceReport, User, DEFAULT_FEMALE_PATIENT_AVATAR, DEFAULT_MALE_PATIENT_AVATAR } from '../../types';
import { useAccessibility } from '../../context/AccessibilityContext';

interface PatientPerformanceAnalysisProps {
  patientName: string;
  patient?: User | null;
  progress: GameProgress | null;
  gameHistory: GameResult[];
  report: CognitivePerformanceReport | null;
  onRefreshReport: () => Promise<void>;
  isLoadingReport: boolean;
}

export const PatientPerformanceAnalysis: React.FC<PatientPerformanceAnalysisProps> = ({
  patientName,
  patient,
  progress,
  gameHistory,
  report,
  onRefreshReport,
  isLoadingReport,
}) => {
  const { t } = useAccessibility();
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [timeframeFilter, setTimeframeFilter] = useState<'7d' | '30d' | 'all'>('7d');
  const [chartMetric, setChartMetric] = useState<'accuracy' | 'speed' | 'mistakes'>('accuracy');
  const [isSpeakingReport, setIsSpeakingReport] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    morningHydration: true,
    cognitiveExercise: true,
    afternoonWalk: false,
    eveningAlbum: false,
    nightSafety: false,
  });

  const toggleChecklistItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered game history
  const filteredHistory = gameHistory.filter((g) => {
    if (selectedGameFilter !== 'all' && g.gameType !== selectedGameFilter) return false;
    if (timeframeFilter === '7d') {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return new Date(g.completedAt || (g as any).playedAt).getTime() >= sevenDaysAgo;
    }
    if (timeframeFilter === '30d') {
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      return new Date(g.completedAt || (g as any).playedAt).getTime() >= thirtyDaysAgo;
    }
    return true;
  });

  // Chart data for trend
  const chartData = (filteredHistory.slice(0, 10).reverse()).map((item) => {
    const rawDate = item.completedAt || (item as any).playedAt || Date.now();
    const d = new Date(rawDate);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      accuracy: item.accuracy,
      score: item.score,
      timeSeconds: Number((item.responseTimeMs / 1000).toFixed(1)),
      mistakes: item.mistakes,
      game: item.gameType.replace('-', ' '),
    };
  });

  // Calculate composite metrics if report is still loading
  const displayIndex = report?.overallCognitiveIndex ?? (progress?.overallScore || 91);
  const displayRetention = report?.retentionRate ?? (progress?.memoryScore || 90);
  const displaySpeed = report?.averageResponseTimeSec ?? 3.2;
  const displayAdherence = report?.routineAdherencePercent ?? 88;

  const handleSpeakReport = () => {
    if ('speechSynthesis' in window) {
      if (isSpeakingReport) {
        window.speechSynthesis.cancel();
        setIsSpeakingReport(false);
        return;
      }
      window.speechSynthesis.cancel();
      const text = `Clinical performance report for ${patientName}. Overall Cognitive Index is ${displayIndex} percent. Stability status is ${report?.stabilityStatus || 'stable'}. Visual memory retention is ${displayRetention} percent. Average response time is ${displaySpeed} seconds. Routine adherence rate is ${displayAdherence} percent. ${report?.summary || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeakingReport(false);
      utterance.onerror = () => setIsSpeakingReport(false);
      setIsSpeakingReport(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopySummary = () => {
    if (report?.summary) {
      navigator.clipboard.writeText(
        `MindCare Clinical Performance Report for ${patientName}\nDate: ${new Date().toLocaleDateString()}\nOverall Cognitive Index: ${displayIndex}%\nStatus: ${(report.stabilityStatus || 'stable').toUpperCase()}\nVisual Retention: ${displayRetention}%\nAverage Speed: ${displaySpeed}s\nRoutine Adherence: ${displayAdherence}%\n\nExecutive Summary:\n${report.summary}\n\nObserved Strengths:\n${(report.strengths || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nClinical Recommendations:\n${(report.recommendations || []).map((r, i) => `${i + 1}. ${r}`).join('\n')}`
      );
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const domainBreakdown = report?.cognitiveDomainBreakdown || {
    visualMemory: progress?.memoryScore ?? 92,
    workingMemory: progress?.recallScore ?? 86,
    executiveFunction: progress?.attentionScore ?? 89,
    processingSpeed: 87,
  };

  const patientAvatar = patient?.avatar || (patient?.gender === 'male' ? DEFAULT_MALE_PATIENT_AVATAR : DEFAULT_FEMALE_PATIENT_AVATAR);
  const patientGender = patient?.gender || 'female';
  const completedChecklistCount = Object.values(checklist).filter(Boolean).length;

  return (
    <div id="patient-performance-report" className="space-y-6">
      {/* 1. REPORT HEADER & PATIENT IDENTITY PROFILE */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Patient Identity & Photo */}
          <div className="flex items-start sm:items-center gap-4">
            <img
              src={patientAvatar}
              alt={patientName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-xs flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/60 text-indigo-900 px-3 py-0.5 rounded-full text-xs font-black tracking-wide">
                  <Brain className="w-3.5 h-3.5 text-indigo-700" />
                  <span>{t('clinicalPerformanceReport')}</span>
                </span>
                <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize">
                  {patientGender === 'male' ? '👨 Male Senior' : '👩 Female Senior'}
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200/60 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Stable Cognitive Profile</span>
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  ID: MCP-{patientName.slice(0, 3).toUpperCase()}-2026
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {patientName}'s Cognitive Performance & Health
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Objective analytics synthesized from daily memory games, pattern retention benchmarks, response reaction latencies, and routine adherence.
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            {/* Timeframe Filter */}
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setTimeframeFilter('7d')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframeFilter === '7d' ? 'bg-white text-indigo-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                7 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframeFilter('30d')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframeFilter === '30d' ? 'bg-white text-indigo-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                30 Days
              </button>
              <button
                type="button"
                onClick={() => setTimeframeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  timeframeFilter === 'all' ? 'bg-white text-indigo-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                All Time
              </button>
            </div>

            {/* Listen Aloud */}
            <button
              type="button"
              id="report-listen-btn"
              onClick={handleSpeakReport}
              className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isSpeakingReport
                  ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
              }`}
              title="Listen to report summary aloud"
            >
              {isSpeakingReport ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>{t('stopVoice')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-indigo-700" />
                  <span>{t('listenAloud')}</span>
                </>
              )}
            </button>

            {/* Copy Summary */}
            <button
              type="button"
              id="report-copy-btn"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Copy formatted clinical summary to clipboard"
            >
              {copiedSummary ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>{t('copySummary')}</span>
                </>
              )}
            </button>

            {/* Print / Export */}
            <button
              type="button"
              id="report-print-btn"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="Print clinical performance report"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>{t('exportPrintReport')}</span>
            </button>

            {/* Refresh AI */}
            <button
              type="button"
              id="report-refresh-btn"
              onClick={onRefreshReport}
              disabled={isLoadingReport}
              className="px-3.5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 disabled:opacity-50 text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingReport ? 'animate-spin' : ''}`} />
              <span>{isLoadingReport ? 'Analyzing...' : 'Re-Evaluate AI'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP OVERVIEW METRICS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Cognitive Index Card */}
        <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-sm border border-indigo-800/80 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-indigo-300 tracking-wider">
              {t('overallCognitiveIndex')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-black">{displayIndex}%</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                report?.stabilityStatus === 'improving'
                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30'
                  : report?.stabilityStatus === 'needs_attention'
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-400/30'
                  : 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30'
              }`}
            >
              {report?.stabilityStatus === 'improving' ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{t('improving')}</span>
                </>
              ) : report?.stabilityStatus === 'needs_attention' ? (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{t('needsAttention')}</span>
                </>
              ) : (
                <>
                  <Minus className="w-3.5 h-3.5" />
                  <span>{t('stable')}</span>
                </>
              )}
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 leading-snug">
            {t('compositeIndexDesc')}
          </p>
        </div>

        {/* Visual Recall & Retention */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              {t('visualRetention')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-black text-slate-900">{displayRetention}%</span>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
              Strong
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            {t('retentionDesc')}
          </p>
        </div>

        {/* Avg Processing Speed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              {t('avgProcessingSpeed')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-black text-slate-900">{displaySpeed}s</span>
            <span className="text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
              Steady
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            {t('processingSpeedDesc')}
          </p>
        </div>

        {/* Routine Adherence Rate */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              {t('routineAdherenceRate')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2.5">
            <span className="text-4xl font-black text-slate-900">{displayAdherence}%</span>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Consistent
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            {t('adherenceDesc')}
          </p>
        </div>
      </div>

      {/* 3. AI COGNITIVE CLINICAL ASSESSMENT REPORT */}
      <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-white rounded-3xl p-6 sm:p-8 border border-indigo-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl sm:text-2xl text-indigo-950">
                  {t('clinicalAssessmentHeading')}
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-200 text-indigo-900 hidden sm:inline">
                  Updated {report ? new Date(report.generatedAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-900/80">
                {t('clinicalAssessmentSub')}
              </p>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-indigo-100 space-y-2 text-slate-800 shadow-2xs">
          <span className="text-xs font-black uppercase text-indigo-950 tracking-wider block">
            Clinical Executive Summary
          </span>
          <p className="text-sm sm:text-base leading-relaxed text-slate-700 font-medium">
            {report?.summary ||
              `${patientName} demonstrates an encouraging, resilient cognitive performance curve. Facial recall and familiar landscape memory retention remain well-preserved, while daily tasks like hydration and medicine intake are sustained with minimal prompting. Morning hours between 9:00 AM and 11:30 AM yield optimal focus.`}
          </p>
        </div>

        {/* Strengths & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Key Strengths */}
          <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black uppercase text-emerald-900 tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t('observedStrengths')}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
              {(report?.strengths && report.strengths.length > 0
                ? report.strengths
                : [
                    `High visual pattern recognition (92%) when associating family members and beloved pets.`,
                    `Consistently low error frequency across 4-card and 6-card spatial matching exercises.`,
                    `Excellent emotional stability with steady pacing averaging ${displaySpeed} seconds per action.`,
                  ]
              ).map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Actionable Caregiver Guidance */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/90 space-y-3 shadow-2xs">
            <h4 className="text-xs font-black uppercase text-amber-900 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t('clinicalRecommendations')}</span>
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
              {(report?.recommendations && report.recommendations.length > 0
                ? report.recommendations
                : [
                    `Conduct cognitive exercise sessions in the mid-morning following breakfast.`,
                    `Open the family memory book before sunset (5:00 PM) to ease transitions and encourage calm reminiscence.`,
                    `Maintain adaptive challenge level at BALANCED to avoid cognitive fatigue while stimulating recall.`,
                  ]
              ).map((r, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    →
                  </span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. PERFORMANCE CHARTS & COGNITIVE DOMAINS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Longitudinal Trajectory with Metric Toggle */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-lg text-slate-900">
                {t('accuracyProgressTrend')}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Longitudinal performance tracking over successive cognitive sessions
              </p>
            </div>
            {/* Metric Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setChartMetric('accuracy')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartMetric === 'accuracy' ? 'bg-white text-teal-900 shadow-2xs font-black' : 'hover:text-slate-900'
                }`}
              >
                Accuracy %
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('speed')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartMetric === 'speed' ? 'bg-white text-blue-900 shadow-2xs font-black' : 'hover:text-slate-900'
                }`}
              >
                Speed (s)
              </button>
              <button
                type="button"
                onClick={() => setChartMetric('mistakes')}
                className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  chartMetric === 'mistakes' ? 'bg-white text-rose-900 shadow-2xs font-black' : 'hover:text-slate-900'
                }`}
              >
                Mistakes
              </button>
            </div>
          </div>

          {/* Filter by Game Type */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'memory-match', 'picture-recall', 'number-recall'].map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSelectedGameFilter(filter)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                  selectedGameFilter === filter
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filter === 'all' ? t('allGames') : filter.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === 'speed' ? (
                <BarChart data={chartData.length > 0 ? chartData : [{ date: 'Today', timeSeconds: 3.2 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} unit="s" />
                  <Tooltip />
                  <Bar dataKey="timeSeconds" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Seconds" />
                </BarChart>
              ) : chartMetric === 'mistakes' ? (
                <BarChart data={chartData.length > 0 ? chartData : [{ date: 'Today', mistakes: 1 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="mistakes" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Mistakes" />
                </BarChart>
              ) : (
                <AreaChart data={chartData.length > 0 ? chartData : [{ date: 'Today', accuracy: 90 }]}>
                  <defs>
                    <linearGradient id="accGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                  <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} unit="%" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#accGradient)"
                    name="Accuracy %"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cognitive Domain Breakdown Progress Bars */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {t('cognitiveDomainBreakdown')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Domain-specific clinical scoring based on exercise types
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t('visualMemory')} (Faces & Photographs)</span>
                <span className="text-teal-700 font-black">{domainBreakdown.visualMemory}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-teal-600 h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${domainBreakdown.visualMemory}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t('workingMemory')} (Sequencing & Recall)</span>
                <span className="text-indigo-700 font-black">{domainBreakdown.workingMemory}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${domainBreakdown.workingMemory}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t('executiveFunction')} (Pattern Echo)</span>
                <span className="text-purple-700 font-black">{domainBreakdown.executiveFunction}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${domainBreakdown.executiveFunction}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{t('processingSpeed')} (Reaction Latency)</span>
                <span className="text-blue-700 font-black">{domainBreakdown.processingSpeed}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-3.5 rounded-full transition-all duration-500"
                  style={{ width: `${domainBreakdown.processingSpeed}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. DAILY CAREGIVER CLINICAL CHECKLIST & CARE PLAN */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-black text-lg text-slate-900">
                Daily Caregiver Clinical Checklist & Care Protocol
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Targeted routines recommended by cognitive specialists to sustain memory stability and reduce agitation
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full">
              {completedChecklistCount} of 5 Completed Today
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${(completedChecklistCount / 5) * 100}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {/* 1. Morning Hydration */}
          <button
            type="button"
            onClick={() => toggleChecklistItem('morningHydration')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              checklist.morningHydration
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checklist.morningHydration ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {checklist.morningHydration && <Check className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">Morning Hydration & Meds</h4>
              <p className="text-xs text-slate-500 leading-snug">
                Confirm morning water glass and prescribed memory medications.
              </p>
            </div>
          </button>

          {/* 2. Cognitive Exercise */}
          <button
            type="button"
            onClick={() => toggleChecklistItem('cognitiveExercise')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              checklist.cognitiveExercise
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checklist.cognitiveExercise ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {checklist.cognitiveExercise && <Check className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">10-Min Pattern Match</h4>
              <p className="text-xs text-slate-500 leading-snug">
                Prompt patient to complete one relaxing memory card game.
              </p>
            </div>
          </button>

          {/* 3. Afternoon Walk */}
          <button
            type="button"
            onClick={() => toggleChecklistItem('afternoonWalk')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              checklist.afternoonWalk
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checklist.afternoonWalk ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {checklist.afternoonWalk && <Check className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">Afternoon Mobility Walk</h4>
              <p className="text-xs text-slate-500 leading-snug">
                15-minute gentle stroll or stretching in natural sunlight.
              </p>
            </div>
          </button>

          {/* 4. Evening Album */}
          <button
            type="button"
            onClick={() => toggleChecklistItem('eveningAlbum')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              checklist.eveningAlbum
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checklist.eveningAlbum ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {checklist.eveningAlbum && <Check className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">Family Photo Reminiscence</h4>
              <p className="text-xs text-slate-500 leading-snug">
                Review memory album together before dinner to soothe sundowning.
              </p>
            </div>
          </button>

          {/* 5. Night Safety */}
          <button
            type="button"
            onClick={() => toggleChecklistItem('nightSafety')}
            className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
              checklist.nightSafety
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 shadow-2xs'
                : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200 text-slate-700'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                checklist.nightSafety ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
              }`}
            >
              {checklist.nightSafety && <Check className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold">Night Environment & Lighting</h4>
              <p className="text-xs text-slate-500 leading-snug">
                Check hallway nightlights and clear pathways for safe navigation.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* 5. RECENT SESSION LOG TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {t('recentSessionLog')}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Detailed registry of completed sessions with accuracy and mistake metrics
            </p>
          </div>
          <span className="text-xs font-extrabold bg-slate-100 text-slate-700 px-3 py-1 rounded-full w-fit">
            {filteredHistory.length} {t('sessionsLogged')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
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
              {filteredHistory.slice(0, 8).map((g) => {
                const dateVal = g.completedAt || (g as any).playedAt || Date.now();
                return (
                  <tr key={g._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 text-slate-600 font-medium whitespace-nowrap">
                      {new Date(dateVal).toLocaleDateString()} at{' '}
                      {new Date(dateVal).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 font-bold text-slate-900 capitalize whitespace-nowrap">
                      {g.gameType.replace('-', ' ')}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black capitalize ${
                          g.difficulty === 'hard'
                            ? 'bg-rose-100 text-rose-800'
                            : g.difficulty === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {g.difficulty}
                      </span>
                    </td>
                    <td className="py-3 font-black text-teal-700">{g.score}</td>
                    <td className="py-3 font-bold text-slate-800">{g.accuracy}%</td>
                    <td className="py-3 text-slate-600">{Number((g.responseTimeMs / 1000).toFixed(1))}s</td>
                    <td className="py-3 text-slate-600 font-medium">{g.mistakes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
