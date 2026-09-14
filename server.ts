import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

import { app } from './server/app.js';
import { ensureDatabase } from './server/db/schema.js';

dotenv.config();

async function startServer() {
  // Initialize Database (MongoDB with resilient in-memory fallback)
  await ensureDatabase();

  const PORT = Number(process.env.PORT) || 3000;

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
