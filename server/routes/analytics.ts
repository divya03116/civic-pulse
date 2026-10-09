import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// GET full analytics summary
router.get('/overview', (req: Request, res: Response) => {
  try {
    const summary = storage.getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET department specific rankings
router.get('/departments', (req: Request, res: Response) => {
  try {
    const summary = storage.getAnalyticsSummary();
    res.json({ success: true, data: summary.departments });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET ward heatmap points
router.get('/wards', (req: Request, res: Response) => {
  try {
    const summary = storage.getAnalyticsSummary();
    res.json({ success: true, data: summary.wards });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
