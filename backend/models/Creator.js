import mongoose from 'mongoose';

const creatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Creator = mongoose.model('Creator', creatorSchema);
export default Creator;
