import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'Nouvelle conversation' },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  provider: { type: String, enum: ['openai', 'gemini', 'mistral'], default: 'openai' },
  model: { type: String },
  isActive: { type: Boolean, default: true },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

chatSchema.index({ userId: 1, updatedAt: -1 });

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
