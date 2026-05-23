import express from 'express';
import crypto from 'crypto';
import Class from '../models/Class.js';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Generate a short unique code like "AB3F7K"
function generateCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// Create a class (teacher or admin)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, grade } = req.body;
    if (!name) return res.status(400).json({ message: 'Sinf nomi talab qilinadi' });

    let joinCode;
    let tries = 0;
    do {
      joinCode = generateCode();
      tries++;
    } while (await Class.findOne({ joinCode }) && tries < 10);

    const cls = new Class({ name, grade, teacher: req.user.id, joinCode, students: [] });
    await cls.save();
    await cls.populate('teacher', 'name email');
    res.status(201).json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my classes (as teacher or as student)
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const asTeacher = await Class.find({ teacher: req.user.id })
      .populate('teacher', 'name')
      .populate('students', 'name email')
      .sort({ createdAt: -1 });

    const asStudent = await Class.find({ students: req.user.id })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    res.json({ teaching: asTeacher, enrolled: asStudent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join a class by code (student)
router.post('/join', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Kod kiritilmadi' });

    const cls = await Class.findOne({ joinCode: code.toUpperCase().trim() });
    if (!cls) return res.status(404).json({ message: 'Bunday kod bilan sinf topilmadi' });
    if (cls.teacher.toString() === req.user.id) return res.status(400).json({ message: 'Siz bu sinfning o\'qituvchisisiz' });
    if (cls.students.map(s => s.toString()).includes(req.user.id)) return res.status(400).json({ message: 'Siz allaqachon bu sinfga qo\'shilgansiz' });

    cls.students.push(req.user.id);
    await cls.save();
    await cls.populate('teacher', 'name');
    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Leave a class (student)
router.delete('/:id/leave', requireAuth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Topilmadi' });
    cls.students = cls.students.filter(s => s.toString() !== req.user.id);
    await cls.save();
    res.json({ message: 'Sinfdan chiqdingiz' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a class (teacher only)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Topilmadi' });
    if (cls.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    await cls.deleteOne();
    res.json({ message: 'Sinf o\'chirildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove a student from class (teacher only)
router.delete('/:id/students/:studentId', requireAuth, async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Topilmadi' });
    if (cls.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Ruxsat yo\'q' });
    }
    cls.students = cls.students.filter(s => s.toString() !== req.params.studentId);
    await cls.save();
    res.json({ message: 'O\'quvchi sinfdan chiqarildi' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
