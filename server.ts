import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { authRouter } from './server/routes/auth.js';
import { patientsRouter } from './server/routes/patients.js';
import { memoriesRouter } from './server/routes/memories.js';
import { gamesRouter } from './server/routes/games.js';
import { remindersRouter } from './server/routes/reminders.js';
import { aiRouter } from './server/routes/ai.js';
import { notificationsRouter } from './server/routes/notifications.js';
import { initDatabase, getDatabaseStatus } from './server/db/schema.js';

dotenv.config();

async function startServer() {
  // Initialize Database (MongoDB with resilient in-memory fallback)
  await initDatabase();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'MindCare API',
      timestamp: new Date().toISOString(),
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // MongoDB Status & Diagnostics
  app.get('/api/db/status', async (_req, res) => {
    try {
      const status = await getDatabaseStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to retrieve database status', details: err.message });
    }
  });

  // Register API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);
  app.use('/api/memories', memoriesRouter);
  app.use('/api/games', gamesRouter);
  app.use('/api/reminders', remindersRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/notifications', notificationsRouter);

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  🧠 MindCare Full-Stack Application is running!
  ➜ Local:   http://localhost:${PORT}
  ➜ Network: http://0.0.0.0:${PORT}
  ➜ API:     http://localhost:${PORT}/api/health
`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MindCare server:', err);
  process.exit(1);
});
