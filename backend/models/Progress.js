import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: mongoose.Schema.Types.ObjectId, ref: 'Text', required: true },
  readAt: { type: Date, default: Date.now },
});

// One entry per user+text
progressSchema.index({ user: 1, text: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
