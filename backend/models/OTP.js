import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['email', 'whatsapp', 'reset'], required: true },
  expiresAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 5 },
  verified: { type: Boolean, default: false },
}, { timestamps: true });

otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);
export default OTP;
