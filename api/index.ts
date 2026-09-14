import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/app.js';
import { ensureDatabase } from '../server/db/schema.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureDatabase();
  } catch (err) {
    console.warn('Database initialization warning in serverless handler:', err);
  }
  return app(req, res);
}

export { app };
