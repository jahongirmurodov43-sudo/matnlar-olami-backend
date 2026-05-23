import express from 'express';
import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create assignment (teacher)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, classId, texts, deadline, note } = req.body;
    if (!title || !classId || !texts?.length) return res.status(400).json({ message: 'title, classId, texts talab qilinadi' });

    // Verify requester is teacher of this class
    const cls = await Class.findById(classId);
    if (!cls) return res.status(404).json({ message: 'Sinf topilmadi' });
    if (cls.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Faqat sinf o\'qituvchisi topshiriq bera oladi' });
    }

    const assignment = new Assignment({ title, classId, texts, deadline, note, teacher: req.user.id });
    await assignment.save();
    await assignment.populate('texts', 'title grade quarter');
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignments for teacher's classes
router.get('/teaching', requireAuth, async (req, res) => {
  try {
    const classes = await Class.find({ teacher: req.user.id }).select('_id');
    const ids = classes.map(c => c._id);
    const assignments = await Assignment.find({ classId: { $in: ids } })
      .populate('texts', 'title grade quarter')
      .populate('classId', 'name')
      .sort({ createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get assignments for student (enrolled classes)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const classes = await Class.find({ students: req.user.id }).select('_id name');
    const ids = classes.map(c => c._id);
    const assignments = await Assignment.find({ classId: { $in: ids } })
      .populate('texts', 'title grade quarter _id')
      .populate('classId', 'name')
      .sort({ deadline: 1, createdAt: -1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete assignment (teacher)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Topilmadi' });
    if (a.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    await a.deleteOne();
    res.json({ message: 'O\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
