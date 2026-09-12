import express, { Request, Response } from 'express';
import { db } from '../db/schema.js';
import {
  askMemoryAssistant,
  analyzePatientPerformance,
  analyzeImageDirectly,
  analyzeAudioVoice,
  analyzeTextDirectly,
} from '../services/aiService.js';

export const aiRouter = express.Router();

// POST /api/ai/chat (Supports voice, text, and camera vision)
aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, message, imageBase64, mimeType, conversationHistory } = req.body;

    if (!patientId || (!message && !imageBase64)) {
      res.status(400).json({ error: 'patientId and either message or imageBase64 are required.' });
      return;
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Authorized patient record not found.' });
      return;
    }

    // Only fetch authorized patient memories and reminders
    const memories = await db.memories.find({ patientId });
    const reminders = await db.reminders.find({ patientId });

    const effectiveMessage = (message || '').trim() || (imageBase64 ? 'Please look at what I am showing you in my camera.' : 'Hello');

    const result = await askMemoryAssistant({
      patient,
      memories,
      reminders,
      userMessage: effectiveMessage,
      imageBase64,
      mimeType,
      conversationHistory: conversationHistory || [],
    });

    // Save to conversation collection
    let conversation = await db.conversations.findOne({ patientId });
    const userMsgObj = {
      id: 'msg_u_' + Date.now(),
      role: 'user' as const,
      content: effectiveMessage + (imageBase64 ? ' [Photo Attached]' : ''),
      timestamp: new Date().toISOString(),
    };
    const assistantMsgObj = {
      id: 'msg_a_' + Date.now(),
      role: 'assistant' as const,
      content: result.reply,
      timestamp: new Date().toISOString(),
    };

    if (conversation) {
      const updatedMessages = [...(conversation.messages || []), userMsgObj, assistantMsgObj].slice(-30);
      await db.conversations.findByIdAndUpdate(conversation._id, {
        messages: updatedMessages,
        lastInteraction: new Date().toISOString(),
      });
    } else {
      conversation = await db.conversations.create({
        patientId,
        messages: [userMsgObj, assistantMsgObj],
        lastInteraction: new Date().toISOString(),
      });
    }

    res.json({
      reply: result.reply,
      actionTaken: result.actionTaken,
      affectedReminder: result.affectedReminder,
      timestamp: new Date().toISOString(),
      conversationId: conversation._id,
    });
  } catch (err: any) {
    console.error('AI chat route error:', err);
    res.status(500).json({
      error: 'AI assistant encountered an issue',
      reply: 'I am right here with you. Please ask me about your family or today\'s reminders, or show an item to your camera.',
    });
  }
});

// GET /api/ai/history/:patientId
aiRouter.get('/history/:patientId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    const conversation = await db.conversations.findOne({ patientId });
    res.json(conversation ? conversation.messages : []);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve conversation history' });
  }
});

// POST /api/ai/analyze-performance
aiRouter.post('/analyze-performance', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.body;
    if (!patientId) {
      res.status(400).json({ error: 'patientId is required.' });
      return;
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found' });
      return;
    }

    const gameResults = await db.gameResults.find({ patientId });
    const reminders = await db.reminders.find({ patientId });
    const memories = await db.memories.find({ patientId });

    const sortedResults = [...gameResults].sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    const report = await analyzePatientPerformance(patient, sortedResults, reminders, memories);

    res.json(report);
  } catch (err: any) {
    console.error('Error analyzing patient performance:', err);
    res.status(500).json({ error: 'Failed to generate cognitive performance analysis' });
  }
});

// POST /api/ai/analyze-image (High-accuracy clinical & everyday vision scanner)
aiRouter.post('/analyze-image', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, imageBase64, mimeType, mode, customQuestion } = req.body;

    if (!patientId || !imageBase64) {
      res.status(400).json({ error: 'patientId and imageBase64 are required.' });
      return;
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    const reminders = await db.reminders.find({ patientId });
    const memories = await db.memories.find({ patientId });

    const result = await analyzeImageDirectly({
      patient,
      reminders,
      memories,
      imageBase64,
      mimeType,
      mode,
      customQuestion,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Image analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze image' });
  }
});

// POST /api/ai/analyze-audio (Voice tone, emotion, clarity, and distress analyzer)
aiRouter.post('/analyze-audio', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, audioBase64, mimeType, transcript, language } = req.body;

    if (!patientId || (!audioBase64 && !transcript)) {
      res.status(400).json({ error: 'patientId and either audioBase64 or transcript are required.' });
      return;
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    const result = await analyzeAudioVoice({
      patient,
      audioBase64,
      mimeType,
      transcript,
      language: language || patient.language,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Audio analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze audio voice' });
  }
});

// POST /api/ai/analyze-text (Text comprehension, disorientation grounding, and schedule checking)
aiRouter.post('/analyze-text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, text, language } = req.body;

    if (!patientId || !text) {
      res.status(400).json({ error: 'patientId and text are required.' });
      return;
    }

    const patient = await db.users.findById(patientId);
    if (!patient) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    const reminders = await db.reminders.find({ patientId });
    const memories = await db.memories.find({ patientId });

    const result = await analyzeTextDirectly({
      patient,
      reminders,
      memories,
      text,
      language: language || patient.language,
    });

    res.json(result);
  } catch (err: any) {
    console.error('Text analysis error:', err);
    res.status(500).json({ error: 'Failed to analyze text' });
  }
});

