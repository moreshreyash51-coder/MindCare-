import React, { useState } from 'react';
import { ArrowLeft, Brain, Eye, Hash, Shapes, Award, Sparkles, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { MemoryMatchGame } from './MemoryMatchGame';
import { PictureRecallGame } from './PictureRecallGame';
import { NumberRecallGame } from './NumberRecallGame';
import { PatternRecognitionGame } from './PatternRecognitionGame';

interface GameHubProps {
  onBackToDashboard: () => void;
}

type ActiveGame = 'menu' | 'memory-match' | 'picture-recall' | 'number-recall' | 'pattern-recognition';

export const GameHub: React.FC<GameHubProps> = ({ onBackToDashboard }) => {
  const { user } = useAuth();
  const { t, speakText, fontSize } = useAccessibility();
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

  const difficulty = user?.cognitiveDifficulty || 'easy';

  if (activeGame === 'memory-match') {
    return <MemoryMatchGame onBack={() => setActiveGame('menu')} />;
  }
  if (activeGame === 'picture-recall') {
    return <PictureRecallGame onBack={() => setActiveGame('menu')} />;
  }
  if (activeGame === 'number-recall') {
    return <NumberRecallGame onBack={() => setActiveGame('menu')} />;
  }
  if (activeGame === 'pattern-recognition') {
    return <PatternRecognitionGame onBack={() => setActiveGame('menu')} />;
  }

  const games = [
    {
      id: 'memory-match' as const,
      title: 'Memory Match',
      desc: 'Turn over cards and match pairs of flowers, pets, and fruits.',
      icon: Brain,
      color: 'from-emerald-500 to-teal-700',
      bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      tag: 'Visual Association',
    },
    {
      id: 'picture-recall' as const,
      title: 'Picture Recall',
      desc: 'Study charming items, then identify which one was shown.',
      icon: Eye,
      color: 'from-blue-500 to-indigo-700',
      bgLight: 'bg-blue-50 border-blue-200 text-blue-900',
      tag: 'Short-term Recall',
    },
    {
      id: 'number-recall' as const,
      title: 'Number Recall',
      desc: 'Look and listen to digit sequences, then type them with large buttons.',
      icon: Hash,
      color: 'from-purple-500 to-violet-700',
      bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
      tag: 'Auditory & Working Memory',
    },
    {
      id: 'pattern-recognition' as const,
      title: 'Pattern Recognition',
      desc: 'Find the repeating rhythm of shapes and colors to fill the question spot.',
      icon: Shapes,
      color: 'from-amber-500 to-orange-700',
      bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
      tag: 'Logical Focus',
    },
  ];

  return (
    <div id="game-hub" className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Top Breadcrumb & Adaptive Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <button
          id="hub-back-btn"
          onClick={onBackToDashboard}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm shadow-xs cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 px-4 py-2 rounded-2xl">
          <Award className="w-5 h-5 text-teal-700" />
          <div className="text-left text-xs">
            <span className="text-teal-700 font-bold uppercase tracking-wider block">
              Adaptive System
            </span>
            <span className="font-extrabold text-teal-950 text-sm capitalize">
              {difficulty === 'hard' ? t('hard') : difficulty === 'medium' ? t('medium') : t('easy')}
            </span>
          </div>
        </div>
      </div>

      {/* Hub Hero */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1
              id="game-hub-title"
              className={`font-black text-slate-900 tracking-tight ${
                fontSize === 'extra-large' ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
              }`}
            >
              Cognitive Exercises & Games
            </h1>
            <p className="text-slate-600 text-base max-w-2xl">
              Choose an exercise below. These games stimulate memory, attention, and recall at a gentle, soothing pace with no penalties or timers.
            </p>
          </div>
          <button
            onClick={() =>
              speakText('Welcome to Cognitive Games. Choose Memory Match, Picture Recall, Number Recall, or Pattern Recognition.')
            }
            className="p-3 rounded-2xl bg-slate-100 hover:bg-teal-50 text-teal-800 border border-slate-200 cursor-pointer hidden sm:block"
            title="Read Games Aloud"
          >
            <Volume2 className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* 4 Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              id={`game-card-${g.id}`}
              onClick={() => setActiveGame(g.id)}
              className="bg-white hover:bg-slate-50/60 rounded-3xl p-6 sm:p-7 border-2 border-slate-200 hover:border-teal-400 text-left shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${g.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
                    {g.tag}
                  </span>
                </div>

                <h3 className="font-extrabold text-2xl text-slate-900 leading-snug">
                  {g.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{g.desc}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-700 font-extrabold text-sm">
                <span>Play Now</span>
                <span className="text-xl">→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
