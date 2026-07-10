import Task from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const { status, priority, search, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) query.title = { $regex: search, $options: 'i' };

    const tasks = await Task.find(query).sort({ position: 1, createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Task.countDocuments(query);

    res.json({ tasks, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'done') updates.completedAt = new Date();
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json({ task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json({ message: 'Tâche supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { tasks } = req.body;
    for (const item of tasks) {
      await Task.findOneAndUpdate(
        { _id: item._id, userId: req.user._id },
        { position: item.position, status: item.status }
      );
    }
    res.json({ message: 'Tâches réorganisées' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
