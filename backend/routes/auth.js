import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // Only allow student or teacher at registration — admin must be set by existing admin
    const safeRole = role === 'teacher' ? 'teacher' : 'student';
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role: safeRole });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { name: user.name, role: user.role, language: user.language }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get current user (for role refresh on app load)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ name: user.name, role: user.role, language: user.language });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ message: 'Joriy parol kiritilmadi' });
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) return res.status(400).json({ message: 'Joriy parol noto\'g\'ri' });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    res.json({ user: { name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forgot password — sends reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return 200 to prevent email enumeration
    if (!user) return res.json({ message: 'Agar email mavjud bo\'lsa, xabar yuboriladi.' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/parolni-tiklash?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Matnlar Olami" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Parolni tiklash — Matnlar Olami',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:2rem;background:#fafaf7;border-radius:12px;">
          <h2 style="color:#2d5a27;font-family:serif;">Parolni tiklash</h2>
          <p>Salom <strong>${user.name}</strong>!</p>
          <p>Parolni tiklash uchun quyidagi tugmani bosing. Havola <strong>1 soat</strong> davomida amal qiladi.</p>
          <a href="${resetURL}" style="display:inline-block;margin:1rem 0;padding:12px 28px;background:#2d5a27;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;">Parolni tiklash</a>
          <p style="color:#888;font-size:0.85rem;">Agar siz bu so'rov yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring.</p>
        </div>
      `,
    });

    res.json({ message: 'Agar email mavjud bo\'lsa, xabar yuboriladi.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset password — verifies token and sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: 'Token va yangi parol talab qilinadi' });

    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) return res.status(400).json({ message: 'Token noto\'g\'ri yoki muddati o\'tgan' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: 'Parol muvaffaqiyatli o\'zgartirildi. Endi tizimga kiring.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;