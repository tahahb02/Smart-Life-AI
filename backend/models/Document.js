import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['image', 'pdf', 'docx', 'txt', 'other'], required: true },
  url: { type: String, required: true },
  cloudinaryId: { type: String },
  size: { type: Number },
  mimeType: { type: String },
  relatedTo: { type: String, enum: ['appointment', 'medicine', 'invoice', 'avatar', 'other'] },
  relatedId: { type: mongoose.Schema.Types.ObjectId },
}, { timestamps: true });

documentSchema.index({ userId: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
