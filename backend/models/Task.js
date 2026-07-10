import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in_progress', 'done', 'cancelled'], default: 'todo' },
  deadline: { type: Date },
  tags: [{ type: String }],
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  position: { type: Number, default: 0 },
  estimatedTime: { type: Number },
  completedAt: { type: Date },
}, { timestamps: true });

taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ deadline: 1 });

const Task = mongoose.model('Task', taskSchema);
export default Task;
