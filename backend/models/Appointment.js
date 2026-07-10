import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, required: true },
  endDate: { type: Date },
  location: { type: String, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'], default: 'scheduled' },
  notifications: [{ type: Number }],
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  googleEventId: { type: String },
}, { timestamps: true });

appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ userId: 1, status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
