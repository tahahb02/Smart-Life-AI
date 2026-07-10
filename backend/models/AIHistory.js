import mongoose from 'mongoose';

const aiHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['summary', 'chat', 'recommendation', 'analysis', 'quiz', 'flashcard'], required: true },
  input: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  provider: { type: String, enum: ['openai', 'gemini', 'mistral'] },
  tokensUsed: { type: Number },
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

aiHistorySchema.index({ userId: 1, createdAt: -1 });
aiHistorySchema.index({ userId: 1, type: 1 });

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);
export default AIHistory;
