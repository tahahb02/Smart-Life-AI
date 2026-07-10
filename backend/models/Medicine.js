import mongoose from 'mongoose';

const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  times: [{ type: String }],
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  notes: { type: String },
  photo: { type: String },
  prescription: { type: String },
  remaining: { type: Number },
  notifications: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

medicineSchema.index({ userId: 1, active: 1 });

const Medicine = mongoose.model('Medicine', medicineSchema);
export default Medicine;
