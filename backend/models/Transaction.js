import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'] },
  tags: [{ type: String }],
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
}, { timestamps: true });

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, category: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
