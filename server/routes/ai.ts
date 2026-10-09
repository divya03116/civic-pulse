import { Router, Request, Response } from 'express';
import { AIEngine } from '../aiEngine';
import { ChatEngine } from '../chatEngine';

const router = Router();

// POST real-time classification while user types
router.post('/classify', (req: Request, res: Response) => {
  try {
    const { title, description, imageUrls, location } = req.body;
    const result = AIEngine.classifyComplaint({
      title: title || '',
      description: description || '',
      imageUrls: imageUrls || [],
      location
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST real-time image inspection
router.post('/vision-inspect', (req: Request, res: Response) => {
  try {
    const { imageUrl, context } = req.body;
    const result = AIEngine.inspectImage(imageUrl || '', context || '');
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST real-time duplicate check
router.post('/check-duplicates', (req: Request, res: Response) => {
  try {
    const { lat, lng, department, title, description } = req.body;
    if (!lat || !lng) {
      return res.json({ success: true, data: { hasDuplicate: false, duplicateComplaints: [] } });
    }
    const result = AIEngine.checkDuplicates(
      Number(lat),
      Number(lng),
      department || '',
      title || '',
      description || ''
    );
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST CivicBot chat
router.post('/chat', (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }
    const response = ChatEngine.handleMessage(message, history || []);
    res.json({ success: true, data: response });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
