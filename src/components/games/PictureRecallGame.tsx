import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Volume2, CheckCircle2, XCircle, Sparkles, Clock, Eye } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface PictureRecallGameProps {
  onBack: () => void;
  onGameComplete?: () => void;
}

interface Item {
  id: string;
  name: string;
  emoji: string;
  category: string;
}

const POOL: Item[] = [
  { id: '1', name: 'Golden Teapot', emoji: '🫖', category: 'Kitchen' },
  { id: '2', name: 'Fresh Strawberry', emoji: '🍓', category: 'Fruit' },
  { id: '3', name: 'Blue Butterfly', emoji: '🦋', category: 'Nature' },
  { id: '4', name: 'Wooden Rocking Chair', emoji: '🪑', category: 'Home' },
  { id: '5', name: 'Gentle Puppy', emoji: '🐶', category: 'Pet' },
  { id: '6', name: 'Cozy Wool Blanket', emoji: '🧶', category: 'Comfort' },
  { id: '7', name: 'Bright Sunflower', emoji: '🌻', category: 'Garden' },
  { id: '8', name: 'Fresh Apple', emoji: '🍎', category: 'Fruit' },
  { id: '9', name: 'Music Violin', emoji: '🎻', category: 'Music' },
  { id: '10', name: 'Sweet Cupcake', emoji: '🧁', category: 'Baking' },
];

export const PictureRecallGame: React.FC<PictureRecallGameProps> = ({ onBack, onGameComplete }) => {
  const { user } = useAuth();
  const { speakText } = useAccessibility();

  const difficulty = user?.cognitiveDifficulty || 'easy';
  const studyCount = difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3;

  const [phase, setPhase] = useState<'study' | 'recall' | 'result'>('study');
  const [studyItems, setStudyItems] = useState<Item[]>([]);
  const [targetItem, setTargetItem] = useState<Item | null>(null);
  const [options, setOptions] = useState<Item[]>([]);
  const [selectedOption, setSelectedOption] = useState<Item | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const startNewRound = () => {
    // Shuffle pool
    const shuffled = [...POOL].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, studyCount);
    setStudyItems(chosen);

    // Pick one target that was in the study set
    const target = chosen[Math.floor(Math.random() * chosen.length)];
    setTargetItem(target);

    // Pick 3 distractors not in chosen
    const distractors = shuffled.slice(studyCount).slice(0, 3);
    const roundOptions = [...distractors, target].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);

    setSelectedOption(null);
    setIsCorrect(null);
    setPhase('study');

    const names = chosen.map((c) => c.name).join(', ');
    speakText(`Please look at these ${chosen.length} pictures carefully: ${names}. Take your time, then tap Ready.`);
  };

  useEffect(() => {
    startNewRound();
  }, [difficulty]);

  const handleReadyToRecall = () => {
    setPhase('recall');
    setStartTime(Date.now());
    speakText('Which of these pictures was in the group you just looked at?');
  };

  const handleOptionSelect = async (item: Item) => {
    if (phase !== 'recall' || !targetItem) return;

    const duration = Date.now() - startTime;
    setAttempts((a) => a + 1);
    setSelectedOption(item);

    const correct = item.id === targetItem.id;
    setIsCorrect(correct);

    if (correct) {
      speakText(`Spot on! ${item.name} was indeed in your pictures.`);
    } else {
      setMistakes((m) => m + 1);
      speakText(`Not quite. The correct picture was ${targetItem.name}.`);
    }

    setPhase('result');

    // Record round result
    try {
      await api.recordGameResult({
        patientId: user?._id || 'patient_eleanor',
        gameType: 'picture-recall',
        difficulty,
        score: correct ? 100 : 50,
        accuracy: correct ? 100 : 50,
        responseTimeMs: duration,
        attempts: 1,
        mistakes: correct ? 0 : 1,
      });
      onGameComplete?.();
    } catch (_) {}
  };

  const handleNextRound = () => {
    if (round < maxRounds) {
      setRound((r) => r + 1);
      startNewRound();
    } else {
      // Completed all rounds
      onBack();
    }
  };

  return (
    <div id="picture-recall-game" className="max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <button
          id="recall-back-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700">
            Round {round} of {maxRounds}
          </div>
          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl text-sm font-bold text-blue-800 capitalize">
            Level: {difficulty}
          </div>
        </div>

        <button
          onClick={startNewRound}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>

      {/* PHASE 1: STUDY */}
      {phase === 'study' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4" /> Study Phase
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Look at these pictures carefully
            </h3>
            <p className="text-slate-600 text-base max-w-md mx-auto">
              Take all the time you want to remember these {studyItems.length} items. When you feel ready, tap the green button below.
            </p>
          </div>

          {/* Cards to remember */}
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6 py-4">
            {studyItems.map((item) => (
              <div
                key={item.id}
                className="w-28 sm:w-36 aspect-square bg-gradient-to-b from-blue-50 to-indigo-50/50 border-2 border-blue-200 rounded-3xl p-4 flex flex-col items-center justify-center shadow-xs"
              >
                <span className="text-5xl sm:text-6xl block mb-2">{item.emoji}</span>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 text-center leading-tight">
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <button
            id="ready-to-recall-btn"
            onClick={handleReadyToRecall}
            className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-lg rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            I am Ready! →
          </button>
        </div>
      )}

      {/* PHASE 2 & 3: RECALL & RESULT */}
      {(phase === 'recall' || phase === 'result') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center">
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Which item was in your pictures?
            </h3>
            <p className="text-slate-600 text-base max-w-md mx-auto">
              Choose the one item that was part of the pictures you just studied.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto py-2">
            {options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              const isTarget = targetItem?.id === option.id;

              let cardStyle =
                'bg-slate-50 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-slate-900';
              if (phase === 'result') {
                if (isTarget) {
                  cardStyle = 'bg-emerald-100 border-2 border-emerald-500 text-emerald-950 scale-105';
                } else if (isSelected && !isTarget) {
                  cardStyle = 'bg-rose-100 border-2 border-rose-400 text-rose-950 opacity-80';
                } else {
                  cardStyle = 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={option.id}
                  id={`recall-opt-${option.id}`}
                  onClick={() => handleOptionSelect(option)}
                  disabled={phase === 'result'}
                  className={`p-5 rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${cardStyle}`}
                >
                  <span className="text-5xl block mb-2">{option.emoji}</span>
                  <span className="text-sm font-bold block">{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {phase === 'result' && (
            <div className="space-y-4 pt-2">
              <div
                className={`p-4 rounded-2xl max-w-md mx-auto font-extrabold flex items-center justify-center gap-2 ${
                  isCorrect
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <span>Brilliant! You remembered correctly.</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-amber-600" />
                    <span>Good effort! The correct answer was {targetItem?.name}.</span>
                  </>
                )}
              </div>

              <button
                id="next-round-btn"
                onClick={handleNextRound}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-sm cursor-pointer transition-colors"
              >
                {round < maxRounds ? 'Next Picture Round →' : 'Complete Exercise'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
