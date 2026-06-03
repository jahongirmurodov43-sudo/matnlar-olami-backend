import mongoose from 'mongoose';

const textSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  grade: { type: Number, required: true, min: 1, max: 4 },
  quarter: { type: Number, required: true, min: 1, max: 4 },
  questions: [{
    question: String,
    answer: String,
    options: [String]
  }],
  language: { type: String, enum: ['uz', 'ru'], default: 'uz' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  audioUrl: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Text = mongoose.model('Text', textSchema);
export default Text;