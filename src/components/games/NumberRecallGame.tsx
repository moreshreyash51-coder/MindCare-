import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Volume2, CheckCircle2, Delete, Sparkles, Clock, Eye } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface NumberRecallGameProps {
  onBack: () => void;
  onGameComplete?: () => void;
}

export const NumberRecallGame: React.FC<NumberRecallGameProps> = ({ onBack, onGameComplete }) => {
  const { user } = useAuth();
  const { speakText } = useAccessibility();

  const difficulty = user?.cognitiveDifficulty || 'easy';
  const digitCount = difficulty === 'hard' ? 5 : difficulty === 'medium' ? 4 : 3;

  const [sequence, setSequence] = useState<number[]>([]);
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [inputDigits, setInputDigits] = useState<number[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [round, setRound] = useState(1);
  const maxRounds = 3;

  const generateNewSequence = () => {
    const digits: number[] = [];
    for (let i = 0; i < digitCount; i++) {
      digits.push(Math.floor(Math.random() * 9) + 1);
    }
    setSequence(digits);
    setInputDigits([]);
    setIsCorrect(null);
    setPhase('memorize');

    const spoken = digits.join(', ');
    speakText(`Remember these numbers: ${spoken}`);
  };

  useEffect(() => {
    generateNewSequence();
  }, [difficulty]);

  const handleStartRecall = () => {
    setPhase('recall');
    setStartTime(Date.now());
    speakText('Now enter the numbers you saw.');
  };

  const handleKeypadPress = (num: number) => {
    if (phase !== 'recall' || inputDigits.length >= digitCount) return;
    setInputDigits((prev) => [...prev, num]);
    speakText(String(num));
  };

  const handleBackspace = () => {
    setInputDigits((prev) => prev.slice(0, -1));
  };

  const handleCheckAnswer = async () => {
    if (inputDigits.length !== digitCount) return;

    const duration = Date.now() - startTime;
    const correct = sequence.every((val, idx) => val === inputDigits[idx]);
    setIsCorrect(correct);
    setPhase('result');

    if (correct) {
      speakText('Excellent! Every digit matched perfectly.');
    } else {
      speakText(`Nice try. The numbers were ${sequence.join(', ')}.`);
    }

    try {
      await api.recordGameResult({
        patientId: user?._id || 'patient_eleanor',
        gameType: 'number-recall',
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
    if (round < maxRounds) {
      setRound((r) => r + 1);
      generateNewSequence();
    } else {
      onBack();
    }
  };

  return (
    <div id="number-recall-game" className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
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
            Round {round} of {maxRounds}
          </div>
          <div className="bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-sm font-bold text-purple-800 capitalize">
            Level: {difficulty}
          </div>
        </div>

        <button
          onClick={generateNewSequence}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>

      {/* PHASE 1: MEMORIZE */}
      {phase === 'memorize' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Eye className="w-4 h-4" /> Memorize Digits
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Remember this number sequence
            </h3>
            <p className="text-slate-600 text-base">
              Look closely or listen to the voice. Press Ready when you have them memorized.
            </p>
          </div>

          {/* Number Cards */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 py-4">
            {sequence.map((num, i) => (
              <div
                key={i}
                className="w-16 h-20 sm:w-20 sm:h-24 bg-gradient-to-b from-purple-50 to-indigo-100/60 border-2 border-purple-300 rounded-2xl flex items-center justify-center shadow-xs"
              >
                <span className="text-4xl sm:text-5xl font-black text-purple-900">{num}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => speakText(`The numbers are: ${sequence.join(', ')}`)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-sm transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              <span>Hear Numbers Again</span>
            </button>

            <button
              id="start-number-recall-btn"
              onClick={handleStartRecall}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-2xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              I am Ready! →
            </button>
          </div>
        </div>
      )}

      {/* PHASE 2 & 3: RECALL & RESULT */}
      {(phase === 'recall' || phase === 'result') && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="space-y-1">
            <h3 className="text-2xl font-extrabold text-slate-900">
              Enter the numbers you remember
            </h3>
            <p className="text-slate-600 text-sm">
              Use the large buttons below to type the {digitCount} digits.
            </p>
          </div>

          {/* Input Display Slots */}
          <div className="flex items-center justify-center gap-3 py-2">
            {Array.from({ length: digitCount }).map((_, idx) => {
              const entered = inputDigits[idx];
              const isFilled = entered !== undefined;

              return (
                <div
                  key={idx}
                  className={`w-14 h-16 sm:w-16 sm:h-18 rounded-2xl border-2 flex items-center justify-center text-3xl font-black transition-all ${
                    phase === 'result'
                      ? isCorrect
                        ? 'bg-emerald-100 border-emerald-500 text-emerald-900'
                        : 'bg-rose-100 border-rose-400 text-rose-900'
                      : isFilled
                      ? 'bg-slate-100 border-purple-500 text-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-300'
                  }`}
                >
                  {isFilled ? entered : '•'}
                </div>
              );
            })}
          </div>

          {/* Elderly-Friendly Large Keypad */}
          {phase === 'recall' && (
            <div className="max-w-xs mx-auto space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    id={`numpad-${num}`}
                    onClick={() => handleKeypadPress(num)}
                    className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-purple-100 text-slate-900 text-2xl font-black border border-slate-200 shadow-xs transition-colors cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={handleBackspace}
                  className="h-16 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-sm font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Erase Last Digit"
                >
                  <Delete className="w-5 h-5" />
                  <span>Erase</span>
                </button>

                <button
                  onClick={() => handleKeypadPress(0)}
                  className="h-16 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-purple-100 text-slate-900 text-2xl font-black border border-slate-200 shadow-xs transition-colors cursor-pointer"
                >
                  0
                </button>

                <button
                  id="submit-number-btn"
                  onClick={handleCheckAnswer}
                  disabled={inputDigits.length !== digitCount}
                  className={`h-16 rounded-2xl font-extrabold text-sm shadow-sm transition-all ${
                    inputDigits.length === digitCount
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Check
                </button>
              </div>
            </div>
          )}

          {/* Result Feedback */}
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
                    <span>Wonderful! You recalled the exact sequence.</span>
                  </>
                ) : (
                  <div>
                    <span>Good try! The numbers were </span>
                    <span className="font-black underline">{sequence.join(' - ')}</span>
                  </div>
                )}
              </div>

              <button
                id="next-num-round-btn"
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl shadow-sm cursor-pointer transition-colors"
              >
                {round < maxRounds ? 'Next Number Round →' : 'Complete Exercise'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
