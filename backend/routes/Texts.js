import express from 'express';
import Text from '../models/Text.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { grade, quarter, language = 'uz' } = req.query;
    const filter = { language };
    if (grade) filter.grade = Number(grade);
    if (quarter) filter.quarter = Number(quarter);

    const texts = await Text.find(filter).sort({ createdAt: -1 });
    res.json(texts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const text = new Text(req.body);
    await text.save();
    res.status(201).json(text);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;