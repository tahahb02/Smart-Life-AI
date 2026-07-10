import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

messageSchema.index({ chatId: 1, createdAt: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
