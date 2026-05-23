import express from 'express';
import Progress from '../models/Progress.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Mark text as read (upsert — safe to call multiple times)
router.post('/:textId', requireAuth, async (req, res) => {
  try {
    await Progress.findOneAndUpdate(
      { user: req.user.id, text: req.params.textId },
      { readAt: new Date() },
      { upsert: true, new: true }
    );
    res.json({ ok: true });
  } catch (err) {
    // Ignore duplicate key errors silently
    res.json({ ok: true });
  }
});

// Get all read text IDs for current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const records = await Progress.find({ user: req.user.id }).select('text readAt').sort({ readAt: -1 });
    res.json(records.map(r => ({ textId: r.text.toString(), readAt: r.readAt })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: get progress for a specific user
router.get('/user/:userId', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    const records = await Progress.find({ user: req.params.userId })
      .populate('text', 'title grade quarter')
      .sort({ readAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
