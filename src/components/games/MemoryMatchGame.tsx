import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, Volume2, Award, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface MemoryMatchGameProps {
  onBack: () => void;
  onGameComplete?: () => void;
}

interface CardItem {
  id: number;
  pairId: number;
  emoji: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_PAIRS = [
  { pairId: 1, emoji: '🌻', name: 'Sunflower' },
  { pairId: 2, emoji: '🐱', name: 'Cozy Cat' },
  { pairId: 3, emoji: '🍎', name: 'Red Apple' },
  { pairId: 4, emoji: '☕', name: 'Warm Tea' },
  { pairId: 5, emoji: '🏡', name: 'Peaceful Home' },
  { pairId: 6, emoji: '🕊️', name: 'White Dove' },
  { pairId: 7, emoji: '🍇', name: 'Sweet Grapes' },
  { pairId: 8, emoji: '🎨', name: 'Paint Palette' },
];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({ onBack, onGameComplete }) => {
  const { user } = useAuth();
  const { speakText, fontSize } = useAccessibility();

  const difficulty = user?.cognitiveDifficulty || 'easy';
  // Pairs count: Easy: 3 pairs (6 cards), Medium: 6 pairs (12 cards), Hard: 8 pairs (16 cards)
  const numPairs = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 6 : 3;

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [difficultyChangeMsg, setDifficultyChangeMsg] = useState<string | null>(null);

  const timerRef = useRef<any>(null);

  // Initialize game board
  const initializeGame = () => {
    const selectedPairs = EMOJI_PAIRS.slice(0, numPairs);
    const deck: CardItem[] = [];

    selectedPairs.forEach((item, i) => {
      deck.push({ id: i * 2, pairId: item.pairId, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
      deck.push({ id: i * 2 + 1, pairId: item.pairId, emoji: item.emoji, name: item.name, isFlipped: false, isMatched: false });
    });

    // Shuffle
    const shuffled = deck.sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIndices([]);
    setAttempts(0);
    setMistakes(0);
    setIsWon(false);
    setDifficultyChangeMsg(null);
    setStartTime(Date.now());
    setElapsedSeconds(0);

    speakText('Find matching pairs of cards by tapping them.');
  };

  useEffect(() => {
    initializeGame();
    return () => clearInterval(timerRef.current);
  }, [difficulty, numPairs]);

  // Elapsed time counter
  useEffect(() => {
    if (!isWon && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isWon, startTime]);

  const handleCardClick = (index: number) => {
    if (flippedIndices.length >= 2 || cards[index].isFlipped || cards[index].isMatched) {
      return;
    }

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    speakText(cards[index].name);

    if (newFlipped.length === 2) {
      setAttempts((a) => a + 1);
      const [idx1, idx2] = newFlipped;
      const card1 = newCards[idx1];
      const card2 = newCards[idx2];

      if (card1.pairId === card2.pairId) {
        // Matched!
        setTimeout(() => {
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards([...newCards]);
          setFlippedIndices([]);
          speakText(`Splendid match! You found both ${card1.name}s.`);

          // Check if game complete
          const allMatched = newCards.every((c) => c.isMatched);
          if (allMatched) {
            handleGameWin(attempts + 1, mistakes);
          }
        }, 500);
      } else {
        // Mistake
        setMistakes((m) => m + 1);
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 1200);
      }
    }
  };

  const handleGameWin = async (finalAttempts: number, finalMistakes: number) => {
    setIsWon(true);
    const durationMs = Date.now() - startTime;
    const accuracy = Math.max(20, Math.min(100, Math.round(100 - (finalMistakes / Math.max(1, finalAttempts)) * 50)));
    const score = Math.max(50, Math.round(accuracy * 1.1));

    speakText(`Wonderful job! You completed the memory match in ${finalAttempts} tries with ${accuracy} percent accuracy!`);

    try {
      const res = await api.recordGameResult({
        patientId: user?._id || 'patient_eleanor',
        gameType: 'memory-match',
        difficulty,
        score,
        accuracy,
        responseTimeMs: durationMs,
        attempts: finalAttempts,
        mistakes: finalMistakes,
      });

      if (res.adaptiveDifficulty?.changed) {
        setDifficultyChangeMsg(
          `Your adaptive level updated to ${res.adaptiveDifficulty.current.toUpperCase()} based on your consistent performance!`
        );
      }
      onGameComplete?.();
    } catch (e) {
      console.warn('Could not record game result:', e);
    }
  };

  return (
    <div id="memory-match-game" className="max-w-4xl mx-auto space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200">
        <button
          id="back-to-hub-btn"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Activities</span>
        </button>

        <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Clock className="w-4 h-4 text-teal-600" />
            <span>Time: {elapsedSeconds}s</span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Tries: {attempts}</span>
          </div>

          <div className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-xl border border-teal-200 font-bold capitalize">
            Level: {difficulty}
          </div>
        </div>

        <button
          id="restart-game-btn"
          onClick={initializeGame}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-sm cursor-pointer transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restart</span>
        </button>
      </div>

      {/* Encouragement & Instructions Banner */}
      <div className="bg-teal-50/70 border border-teal-200/80 rounded-2xl p-4 flex items-center justify-between text-teal-950 text-sm">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <p className="font-semibold">
            Tap a card to turn it over, then find its matching twin. Take your time!
          </p>
        </div>
        <button
          onClick={() => speakText('Tap a card to turn it over, then find its matching twin. Take all the time you need.')}
          className="text-teal-700 hover:text-teal-900 p-1 cursor-pointer"
          title="Listen to Instructions"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Card Grid */}
      <div
        className={`grid gap-4 sm:gap-5 justify-center ${
          numPairs === 3
            ? 'grid-cols-2 sm:grid-cols-3 max-w-lg mx-auto'
            : numPairs === 6
            ? 'grid-cols-3 sm:grid-cols-4 max-w-2xl mx-auto'
            : 'grid-cols-4 sm:grid-cols-4 max-w-3xl mx-auto'
        }`}
      >
        {cards.map((card, idx) => (
          <button
            key={card.id}
            id={`memory-card-${idx}`}
            onClick={() => handleCardClick(idx)}
            disabled={card.isMatched || card.isFlipped}
            className={`w-full aspect-square min-w-[90px] sm:min-w-[120px] rounded-3xl p-3 flex flex-col items-center justify-center transition-all transform cursor-pointer select-none text-center ${
              card.isMatched
                ? 'bg-emerald-100 border-2 border-emerald-400 text-emerald-900 opacity-90 scale-95'
                : card.isFlipped
                ? 'bg-white border-3 border-teal-500 shadow-md scale-100'
                : 'bg-gradient-to-br from-teal-600 to-teal-800 border-2 border-teal-700 shadow-sm hover:scale-[1.03] active:scale-[0.98]'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <div className="space-y-1 text-center">
                <span className="text-4xl sm:text-5xl block filter drop-shadow-xs">{card.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block truncate max-w-[100px]">
                  {card.name}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white/80 font-bold text-lg">
                ?
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Win Modal / Card */}
      {isWon && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-lg animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-2xl sm:text-3xl text-emerald-900">
              Splendid Work! Game Complete!
            </h3>
            <p className="text-emerald-800 text-base max-w-md mx-auto">
              You matched all the cards in <span className="font-bold">{attempts} tries</span> taking{' '}
              <span className="font-bold">{elapsedSeconds} seconds</span>.
            </p>
          </div>

          {difficultyChangeMsg && (
            <div className="bg-teal-100 text-teal-900 p-3 rounded-2xl text-sm font-bold border border-teal-300 max-w-md mx-auto flex items-center gap-2">
              <Award className="w-5 h-5 text-teal-700 flex-shrink-0" />
              <span>{difficultyChangeMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={initializeGame}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-sm cursor-pointer transition-colors"
            >
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl border border-slate-300 shadow-xs cursor-pointer transition-colors"
            >
              Back to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
