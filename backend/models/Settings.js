import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  theme: { type: String, enum: ['light', 'dark'], default: 'light' },
  language: { type: String, default: 'fr' },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    budget: { type: Boolean, default: true },
    task: { type: Boolean, default: true },
    appointment: { type: Boolean, default: true },
    medicine: { type: Boolean, default: true },
  },
  privacy: {
    shareAnalytics: { type: Boolean, default: true },
    saveHistory: { type: Boolean, default: true },
  },
  aiProvider: { type: String, enum: ['openai', 'gemini', 'mistral'], default: 'openai' },
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
