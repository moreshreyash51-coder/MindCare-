import express, { Request, Response } from 'express';
import { db } from '../db/schema.js';

export const remindersRouter = express.Router();

// GET /api/reminders/:patientId
remindersRouter.get('/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const reminders = await db.reminders.find({ patientId });
    // Sort by time
    reminders.sort((a, b) => a.time.localeCompare(b.time));
    res.json(reminders);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// POST /api/reminders
remindersRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, title, time, category, recurrence, notes, description, date, priority, soundEnabled, soundTune } = req.body;

    if (!patientId || !title || !time) {
      res.status(400).json({ error: 'patientId, title, and time are required.' });
      return;
    }

    const newReminder = await db.reminders.create({
      patientId,
      title,
      time,
      category: category || 'task',
      completed: false,
      recurrence: recurrence || 'Daily',
      notes: notes || description || '',
      description: description || notes || '',
      date: date || '',
      priority: priority || 'normal',
      soundEnabled: soundEnabled !== undefined ? Boolean(soundEnabled) : true,
      soundTune: soundTune || 'soothing-song',
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newReminder);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// PUT /api/reminders/:id
remindersRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { completed, title, time, category, recurrence, notes, description, date, priority, soundEnabled, soundTune } = req.body;

    const existing = await db.reminders.findById(id);
    if (!existing) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }

    const updated = await db.reminders.findByIdAndUpdate(id, {
      ...(completed !== undefined ? { completed: Boolean(completed) } : {}),
      ...(title ? { title } : {}),
      ...(time ? { time } : {}),
      ...(category ? { category } : {}),
      ...(recurrence ? { recurrence } : {}),
      ...(notes !== undefined ? { notes } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(date !== undefined ? { date } : {}),
      ...(priority ? { priority } : {}),
      ...(soundEnabled !== undefined ? { soundEnabled: Boolean(soundEnabled) } : {}),
      ...(soundTune ? { soundTune } : {}),
    });

    if (completed && !existing.completed) {
      await db.notifications.create({
        patientId: existing.patientId,
        title: 'Reminder Completed',
        message: `"${existing.title}" checked off for today.`,
        type: 'reminder_due',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// DELETE /api/reminders/:id
remindersRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await db.reminders.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Reminder not found' });
      return;
    }
    res.json({ message: 'Reminder deleted', deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});
