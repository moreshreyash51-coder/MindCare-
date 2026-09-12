import express, { Request, Response } from 'express';
import { db, IGameResult } from '../db/schema.js';

export const gamesRouter = express.Router();

// POST /api/games/result
gamesRouter.post('/result', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, gameType, difficulty, score, accuracy, responseTimeMs, attempts, mistakes } = req.body;

    if (!patientId || !gameType) {
      res.status(400).json({ error: 'patientId and gameType are required.' });
      return;
    }

    const newResult: IGameResult = await db.gameResults.create({
      patientId,
      gameType,
      difficulty: difficulty || 'easy',
      score: Number(score) || 0,
      accuracy: Math.min(100, Math.max(0, Number(accuracy) || 0)),
      responseTimeMs: Number(responseTimeMs) || 3000,
      attempts: Number(attempts) || 1,
      mistakes: Number(mistakes) || 0,
      completedAt: new Date().toISOString(),
    });

    // Adaptive difficulty algorithm
    const allResults = await db.gameResults.find({ patientId });
    // Sort latest first
    const sorted = [...allResults].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    const recent = sorted.slice(0, 3);

    const patient = await db.users.findById(patientId);
    let currentDiff = patient?.cognitiveDifficulty || 'easy';
    let difficultyChanged = false;
    let oldDiff = currentDiff;

    if (recent.length >= 2) {
      const avgAccuracy = recent.reduce((sum, r) => sum + r.accuracy, 0) / recent.length;
      const totalMistakes = recent.reduce((sum, r) => sum + r.mistakes, 0);

      if (currentDiff === 'easy' && avgAccuracy >= 88 && totalMistakes <= 2) {
        currentDiff = 'medium';
        difficultyChanged = true;
      } else if (currentDiff === 'medium' && avgAccuracy >= 92 && totalMistakes <= 2) {
        currentDiff = 'hard';
        difficultyChanged = true;
      } else if (currentDiff === 'hard' && (avgAccuracy < 65 || totalMistakes >= 5)) {
        currentDiff = 'medium';
        difficultyChanged = true;
      } else if (currentDiff === 'medium' && (avgAccuracy < 60 || totalMistakes >= 6)) {
        currentDiff = 'easy';
        difficultyChanged = true;
      }

      if (difficultyChanged && patient) {
        await db.users.findByIdAndUpdate(patientId, { cognitiveDifficulty: currentDiff });

        // Record a notification for the patient and caregiver
        await db.notifications.create({
          patientId,
          title: 'Adaptive Difficulty Updated',
          message: `Cognitive challenge level adjusted to ${currentDiff.toUpperCase()} to match your recent performance.`,
          type: 'difficulty_adapted',
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    res.status(201).json({
      result: newResult,
      adaptiveDifficulty: {
        current: currentDiff,
        previous: oldDiff,
        changed: difficultyChanged,
      },
    });
  } catch (err: any) {
    console.error('Error saving game result:', err);
    res.status(500).json({ error: 'Failed to record game result' });
  }
});

// GET /api/games/results/:patientId
gamesRouter.get('/results/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const results = await db.gameResults.find({ patientId });
    const sorted = results.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch game results' });
  }
});

// GET /api/games/progress/:patientId
gamesRouter.get('/progress/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const results = await db.gameResults.find({ patientId });
    const patient = await db.users.findById(patientId);

    if (results.length === 0) {
      res.json({
        memoryScore: 88,
        attentionScore: 84,
        recallScore: 86,
        overallScore: 86,
        currentDifficulty: patient?.cognitiveDifficulty || 'easy',
        totalGamesPlayed: 0,
        trendData: [
          { day: 'Mon', accuracy: 85, responseTime: 4.2 },
          { day: 'Tue', accuracy: 88, responseTime: 3.8 },
          { day: 'Wed', accuracy: 90, responseTime: 3.5 },
          { day: 'Thu', accuracy: 92, responseTime: 3.2 },
          { day: 'Today', accuracy: 94, responseTime: 3.0 },
        ],
        gameTypeStats: {},
      });
      return;
    }

    // Filter by game type
    const memoryGames = results.filter((r) => r.gameType === 'memory-match');
    const recallGames = results.filter((r) => r.gameType === 'picture-recall' || r.gameType === 'number-recall');
    const attentionGames = results.filter((r) => r.gameType === 'pattern-recognition' || r.gameType === 'memory-match');

    const avg = (arr: IGameResult[], fallback = 85) =>
      arr.length ? Math.round(arr.reduce((acc, curr) => acc + curr.accuracy, 0) / arr.length) : fallback;

    const memoryScore = avg(memoryGames, 92);
    const recallScore = avg(recallGames, 88);
    const attentionScore = avg(attentionGames, 90);
    const overallScore = Math.round((memoryScore + recallScore + attentionScore) / 3);

    // Group by day for trends (last 7 days)
    const sortedChronological = [...results].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );

    const trendData = sortedChronological.slice(-10).map((r) => {
      const date = new Date(r.completedAt);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      return {
        timestamp: r.completedAt,
        date: dayName,
        accuracy: r.accuracy,
        responseTime: +(r.responseTimeMs / 1000).toFixed(1),
        score: r.score,
        gameType: r.gameType,
      };
    });

    // Count today's completed activities
    const today = new Date().toISOString().slice(0, 10);
    const completedToday = results.filter((r) => r.completedAt.slice(0, 10) === today).length;

    res.json({
      memoryScore,
      attentionScore,
      recallScore,
      overallScore,
      currentDifficulty: patient?.cognitiveDifficulty || 'easy',
      totalGamesPlayed: results.length,
      completedToday,
      trendData,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute progress trends' });
  }
});
