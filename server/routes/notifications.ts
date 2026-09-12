import express, { Request, Response } from 'express';
import { db } from '../db/schema.js';

export const notificationsRouter = express.Router();

// GET /api/notifications/:patientId
notificationsRouter.get('/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const list = await db.notifications.find({ patientId });
    const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sorted);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/notifications/:id/read
notificationsRouter.put('/:id/read', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updated = await db.notifications.findByIdAndUpdate(id, { read: true });
    res.json(updated || { success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});
