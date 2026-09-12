import express from 'express';
import path from 'path';
import fs from 'fs';
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
      environment: process.env.NODE_ENV || 'development',
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

  // 404 handler specifically for API routes (prevents returning HTML for missing API endpoints)
  app.all('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found' });
  });

  // Determine if running in production bundle mode
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.argv[1] && (process.argv[1].endsWith('.cjs') || process.argv[1].includes('dist')));

  // Vite middleware for development vs static for production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Resolve dist path
    const distPath = path.resolve(process.cwd(), 'dist');

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
  🧠 MindCare Full-Stack Application is running!
  ➜ Local:   http://localhost:${PORT}
  ➜ Network: http://0.0.0.0:${PORT}
  ➜ API:     http://localhost:${PORT}/api/health
`);
  });

  // Graceful shutdown handling for Docker, Cloud Run & Local termination
  const shutdown = () => {
    console.log('\nGracefully terminating MindCare server...');
    server.close(() => {
      console.log('MindCare server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('Failed to start MindCare server:', err);
  process.exit(1);
});
