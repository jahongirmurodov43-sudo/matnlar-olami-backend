import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

    // Allow any Vercel preview deployment for this project
    const isVercelPreview = origin && /^https:\/\/matnlar-olami[^.]*\.vercel\.app$/.test(origin);

    if (!origin || allowed.includes(origin) || isVercelPreview) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Routes
app.use('/api/auth', (await import('./routes/auth.js')).default);
app.use('/api/texts', (await import('./routes/texts.js')).default);
app.use('/api/creators', (await import('./routes/creators.js')).default);
app.use('/api/users', (await import('./routes/users.js')).default);
app.use('/api/classes', (await import('./routes/classes.js')).default);
app.use('/api/assignments', (await import('./routes/assignments.js')).default);
app.use('/api/progress', (await import('./routes/progress.js')).default);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});