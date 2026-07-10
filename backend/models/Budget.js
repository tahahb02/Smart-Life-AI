import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  category: { type: String, required: true },
  period: { type: String, enum: ['weekly', 'monthly', 'yearly'], default: 'monthly' },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  notifications: { type: Boolean, default: true },
  alertThreshold: { type: Number, default: 80 },
}, { timestamps: true });

budgetSchema.index({ userId: 1, category: 1 });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
