import mongoose from 'mongoose';

const recommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['savings', 'sport', 'nutrition', 'time', 'organization', 'wellness', 'productivity'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  read: { type: Boolean, default: false },
  applied: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

recommendationSchema.index({ userId: 1, date: -1 });
recommendationSchema.index({ userId: 1, type: 1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);
export default Recommendation;
