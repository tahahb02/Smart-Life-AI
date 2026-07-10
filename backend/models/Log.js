import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  resource: { type: String },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  userAgent: { type: String },
  level: { type: String, enum: ['info', 'warn', 'error'], default: 'info' },
}, { timestamps: true });

logSchema.index({ createdAt: -1 });
logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ level: 1 });

const Log = mongoose.model('Log', logSchema);
export default Log;
