import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Volume2, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface PatternRecognitionGameProps {
  onBack: () => void;
  onGameComplete?: () => void;
}

interface PatternPuzzle {
  id: string;
  sequence: { emoji: string; name: string }[];
  missingIndex: number;
  answer: { emoji: string; name: string };
  options: { emoji: string; name: string }[];
  hint: string;
}

const PUZZLES_EASY: PatternPuzzle[] = [
  {
    id: 'e1',
    sequence: [
      { emoji: '🔴', name: 'Red Circle' },
      { emoji: '🔵', name: 'Blue Circle' },
      { emoji: '🔴', name: 'Red Circle' },
      { emoji: '🔵', name: 'Blue Circle' },
      { emoji: '❓', name: 'What comes next?' },
    ],
    missingIndex: 4,
    answer: { emoji: '🔴', name: 'Red Circle' },
    options: [
      { emoji: '🔴', name: 'Red Circle' },
      { emoji: '🔵', name: 'Blue Circle' },
      { emoji: '🟢', name: 'Green Circle' },
    ],
    hint: 'Notice how it goes Red, Blue, Red, Blue...',
  },
  {
    id: 'e2',
    sequence: [
      { emoji: '🌻', name: 'Sunflower' },
      { emoji: '🌹', name: 'Rose' },
      { emoji: '🌻', name: 'Sunflower' },
      { emoji: '🌹', name: 'Rose' },
      { emoji: '❓', name: 'What comes next?' },
    ],
    missingIndex: 4,
    answer: { emoji: '🌻', name: 'Sunflower' },
    options: [
      { emoji: '🌻', name: 'Sunflower' },
      { emoji: '🌹', name: 'Rose' },
      { emoji: '🌷', name: 'Tulip' },
    ],
    hint: 'Sunflower then Rose, Sunflower then Rose...',
  },
  {
    id: 'e3',
    sequence: [
      { emoji: '☀️', name: 'Sun' },
      { emoji: '🌙', name: 'Moon' },
      { emoji: '☀️', name: 'Sun' },
      { emoji: '🌙', name: 'Moon' },
      { emoji: '❓', name: 'What comes next?' },
    ],
    missingIndex: 4,
    answer: { emoji: '☀️', name: 'Sun' },
    options: [
      { emoji: '☀️', name: 'Sun' },
      { emoji: '🌙', name: 'Moon' },
      { emoji: '⭐', name: 'Star' },
    ],
    hint: 'Day and night alternating rhythm.',
  },
];

const PUZZLES_MEDIUM: PatternPuzzle[] = [
  {
    id: 'm1',
    sequence: [
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍌', name: 'Banana' },
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍎', name: 'Apple' },
      { emoji: '❓', name: 'What comes next?' },
    ],
    missingIndex: 5,
    answer: { emoji: '🍌', name: 'Banana' },
    options: [
      { emoji: '🍌', name: 'Banana' },
      { emoji: '🍎', name: 'Apple' },
      { emoji: '🍇', name: 'Grapes' },
    ],
    hint: 'Two apples, then one banana...',
  },
  {
    id: 'm2',
    sequence: [
      { emoji: '🔺', name: 'Triangle' },
      { emoji: '🟩', name: 'Square' },
      { emoji: '🔵', name: 'Circle' },
      { emoji: '🔺', name: 'Triangle' },
      { emoji: '🟩', name: 'Square' },
      { emoji: '❓', name: 'What comes next?' },
    ],
    missingIndex: 5,
    answer: { emoji: '🔵', name: 'Circle' },
    options: [
      { emoji: '🔵', name: 'Circle' },
      { emoji: '🔺', name: 'Triangle' },
      { emoji: '🟩', name: 'Square' },
    ],
    hint: 'Triangle, Square, Circle in a three-step cycle.',
  },
];

export const PatternRecognitionGame: React.FC<PatternRecognitionGameProps> = ({ onBack, onGameComplete }) => {
  const { user } = useAuth();
  const { speakText } = useAccessibility();

  const difficulty = user?.cognitiveDifficulty || 'easy';
  const puzzleList = difficulty === 'hard' || difficulty === 'medium' ? PUZZLES_MEDIUM : PUZZLES_EASY;

  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<{ emoji: string; name: string } | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);

  const currentPuzzle = puzzleList[puzzleIndex] || puzzleList[0];

  useEffect(() => {
    setStartTime(Date.now());
    setSelectedOption(null);
    setIsCorrect(null);
    speakText(`Look at this pattern: ${currentPuzzle.hint}. What belongs in place of the question mark?`);
  }, [puzzleIndex, difficulty]);

  const handleSelect = async (opt: { emoji: string; name: string }) => {
    if (selectedOption) return;

    const duration = Date.now() - startTime;
    setAttempts((a) => a + 1);
    setSelectedOption(opt);

    const correct = opt.emoji === currentPuzzle.answer.emoji;
    setIsCorrect(correct);

    if (correct) {
      speakText(`Spot on! ${opt.name} completes the pattern beautifully.`);
    } else {
      setMistakes((m) => m + 1);
      speakText(`Not quite. The correct next item was ${currentPuzzle.answer.name}.`);
    }

    try {
      await api.recordGameResult({
        patientId: user?._id || 'patient_eleanor',
        gameType: 'pattern-recognition',
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

  const handleNext = () => {
    if (puzzleIndex < puzzleList.length - 1) {
      setPuzzleIndex((i) => i + 1);
    } else {
      onBack();
    }
  };

  return (
    <div id="pattern-recognition-game" className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700">
            Puzzle {puzzleIndex + 1} of {puzzleList.length}
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-sm font-bold text-amber-800 capitalize">
            Level: {difficulty}
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedOption(null);
            setIsCorrect(null);
            setStartTime(Date.now());
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Pattern Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center">
        <div className="space-y-1">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            What completes the pattern?
          </h3>
          <p className="text-slate-600 text-base">
            Observe the sequence below and pick which item fits into the question mark box.
          </p>
        </div>

        {/* Sequence Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-4">
          {currentPuzzle.sequence.map((tile, i) => {
            const isTargetSpot = i === currentPuzzle.missingIndex;
            return (
              <div
                key={i}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shadow-xs transition-all ${
                  isTargetSpot
                    ? selectedOption
                      ? isCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-950 scale-105'
                        : 'bg-rose-100 border-rose-400 text-rose-950'
                      : 'bg-amber-50 border-dashed border-amber-400 text-amber-700 animate-pulse'
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                <span className="text-3xl sm:text-4xl block mb-1">
                  {isTargetSpot && selectedOption ? selectedOption.emoji : tile.emoji}
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-600 truncate max-w-[60px] sm:max-w-[70px]">
                  {isTargetSpot && selectedOption ? selectedOption.name : tile.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Audio Clue Button */}
        <div>
          <button
            onClick={() => speakText(currentPuzzle.hint)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Listen to Pattern Clue</span>
          </button>
        </div>

        {/* Choice Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Choose your answer
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {currentPuzzle.options.map((opt, i) => (
              <button
                key={i}
                id={`pattern-choice-${i}`}
                onClick={() => handleSelect(opt)}
                disabled={Boolean(selectedOption)}
                className={`px-6 py-4 rounded-2xl border-2 flex items-center gap-3 text-lg font-black transition-all shadow-xs cursor-pointer ${
                  selectedOption?.emoji === opt.emoji
                    ? isCorrect
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                      : 'bg-rose-100 border-rose-400 text-rose-950'
                    : 'bg-white hover:bg-teal-50 border-slate-200 hover:border-teal-400 text-slate-900'
                }`}
              >
                <span className="text-4xl">{opt.emoji}</span>
                <span>{opt.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Outcome Feedback */}
        {selectedOption && (
          <div className="space-y-4 pt-4">
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
                  <span>Excellent observation! Pattern solved.</span>
                </>
              ) : (
                <>
                  <XCircle className="w-6 h-6 text-amber-600" />
                  <span>The expected item was {currentPuzzle.answer.name}.</span>
                </>
              )}
            </div>

            <button
              id="pattern-next-btn"
              onClick={handleNext}
              className="px-8 py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-sm cursor-pointer transition-colors"
            >
              {puzzleIndex < puzzleList.length - 1 ? 'Next Pattern →' : 'Complete Exercise'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
