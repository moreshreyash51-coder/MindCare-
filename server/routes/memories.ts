import express, { Request, Response } from 'express';
import { db } from '../db/schema.js';

export const memoriesRouter = express.Router();

// GET /api/memories/:patientId
memoriesRouter.get('/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const memories = await db.memories.find({ patientId });
    res.json(memories);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// POST /api/memories
memoriesRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, title, personName, relationship, description, photoUrl, tags, dateEra } = req.body;

    if (!patientId || !title || !relationship || !description) {
      res.status(400).json({ error: 'Patient ID, title, relationship, and description are required.' });
      return;
    }

    const newMemory = await db.memories.create({
      patientId,
      title,
      personName: personName || '',
      relationship,
      description,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=600&auto=format&fit=crop&q=80',
      tags: tags || ['Personal'],
      dateEra: dateEra || 'Cherished Memory',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Notify caregiver/patient
    await db.notifications.create({
      patientId,
      title: 'New Memory Added',
      message: `"${title}" has been saved to the Memory Book.`,
      type: 'note',
      read: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json(newMemory);
  } catch (err: any) {
    console.error('Error creating memory:', err);
    res.status(500).json({ error: 'Failed to create memory' });
  }
});

// PUT /api/memories/:id
memoriesRouter.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, personName, relationship, description, photoUrl, tags, dateEra } = req.body;

    const updated = await db.memories.findByIdAndUpdate(id, {
      ...(title ? { title } : {}),
      ...(personName !== undefined ? { personName } : {}),
      ...(relationship ? { relationship } : {}),
      ...(description ? { description } : {}),
      ...(photoUrl ? { photoUrl } : {}),
      ...(tags ? { tags } : {}),
      ...(dateEra ? { dateEra } : {}),
    });

    if (!updated) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE /api/memories/:id
memoriesRouter.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await db.memories.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ error: 'Memory not found' });
      return;
    }
    res.json({ message: 'Memory deleted successfully', deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});
