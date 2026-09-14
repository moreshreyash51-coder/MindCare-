import express from 'express';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.js';
import { patientsRouter } from './routes/patients.js';
import { memoriesRouter } from './routes/memories.js';
import { gamesRouter } from './routes/games.js';
import { remindersRouter } from './routes/reminders.js';
import { aiRouter } from './routes/ai.js';
import { notificationsRouter } from './routes/notifications.js';
import { ensureDatabase, getDatabaseStatus } from './db/schema.js';

dotenv.config();

const app = express();

// Standard CORS configuration to ensure cross-origin and Vercel preview branch support
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database initialization middleware ensuring ready state for both long-running and serverless requests
app.use(async (_req, _res, next) => {
  try {
    await ensureDatabase();
  } catch (err) {
    console.warn('Database initialization warning:', err);
  }
  next();
});

// Shared API route definitions
const apiRouter = express.Router();

const healthHandler = (_req: express.Request, res: express.Response) => {
  res.json({
    status: 'ok',
    service: 'MindCare API',
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    environment: process.env.NODE_ENV || 'development',
  });
};

const dbStatusHandler = async (_req: express.Request, res: express.Response) => {
  try {
    const status = await getDatabaseStatus();
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve database status', details: err.message });
  }
};

apiRouter.get('/health', healthHandler);
apiRouter.get('/db/status', dbStatusHandler);
apiRouter.use('/auth', authRouter);
apiRouter.use('/patients', patientsRouter);
apiRouter.use('/memories', memoriesRouter);
apiRouter.use('/games', gamesRouter);
apiRouter.use('/reminders', remindersRouter);
apiRouter.use('/ai', aiRouter);
apiRouter.use('/notifications', notificationsRouter);

// Root health check for /api
app.get('/api', healthHandler);

// Mount at both /api and root level for seamless routing on Vercel Serverless Functions & local dev
app.use('/api', apiRouter);
app.use(apiRouter);

// 404 handler for unknown API routes
app.all('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export { app };
export default app;
