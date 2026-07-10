import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl: { type: String },
  cloudinaryId: { type: String },
  amount: { type: Number },
  vat: { type: Number },
  date: { type: Date },
  company: { type: String, trim: true },
  category: { type: String },
  description: { type: String },
  ocrData: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'processed', 'verified'], default: 'pending' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
}, { timestamps: true });

invoiceSchema.index({ userId: 1, status: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;
