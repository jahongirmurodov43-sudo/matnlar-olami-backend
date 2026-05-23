import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinCode: { type: String, required: true, unique: true },
  grade: { type: Number, min: 1, max: 4 },
  createdAt: { type: Date, default: Date.now },
});

const Class = mongoose.model('Class', classSchema);
export default Class;
