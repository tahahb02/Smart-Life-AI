import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  verifyMethod: { type: String, enum: ['email', 'whatsapp'], default: 'email' },
  address: { type: String },
  language: { type: String, default: 'fr' },
  timezone: { type: String, default: 'Europe/Paris' },
  country: { type: String, default: 'MA' },
  currency: { type: String, default: 'MAD' },
  onboarded: { type: Boolean, default: false },
  aiPreferences: {
    provider: { type: String, enum: ['openai', 'gemini', 'mistral'], default: 'openai' },
    model: { type: String, default: 'gpt-3.5-turbo' },
  },
  // Points de fidélité
  loyaltyPoints: { type: Number, default: 0 },
  pointsHistory: [{ type: { type: String, enum: ['earned', 'spent', 'referral_bonus'] }, amount: Number, description: String, date: { type: Date, default: Date.now } }],

  // Parrainage
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralsCount: { type: Number, default: 0 },

  refreshToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastLogin: { type: Date },
  isActive: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.referralCode && this.isNew) {
    this.referralCode = `SMART-${this.name.slice(0,3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
