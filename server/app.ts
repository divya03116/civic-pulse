import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import complaintsRouter from './routes/complaints';
import analyticsRouter from './routes/analytics';
import aiRouter from './routes/ai';
import imagesRouter from './routes/images';
import { storage } from './storage';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Static uploads directory
const uploadsDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'CivicPulse AI Municipal Grievance Core',
    database: storage.isReady() ? 'connected' : 'unavailable',
    databaseStatus: storage.getStatusMessage(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// All data lives in Firestore, so nothing below can be served until it is connected
app.use('/api', async (req, res, next) => {
  // Serverless instances are frozen between requests, so live listeners cannot be
  // trusted there; reload from Firestore on every request instead.
  if (process.env.VERCEL) {
    try {
      await storage.refresh();
    } catch {
      // fall through to the 503 below with the reason refresh() recorded
    }
  }
  if (storage.isReady()) return next();
  res.status(503).json({ success: false, message: storage.getStatusMessage() });
});

// API Routes
app.use('/api/complaints', complaintsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/images', imagesRouter);

export default app;
