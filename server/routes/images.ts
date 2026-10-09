import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const router = Router();

// GET an uploaded photo stored in Firestore
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const image = await storage.getImage(req.params.id);
    if (!image) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    // Photos never change once stored, so browsers can keep them indefinitely.
    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff'
    });
    res.send(image.data);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
