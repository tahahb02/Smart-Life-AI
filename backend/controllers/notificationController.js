import Notification from '../models/Notification.js';

export const getNotifications = async (req, res) => {
  try {
    const { read, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (read !== undefined) query.read = read === 'true';

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.json({ notifications, total, unreadCount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { read: true });
    res.json({ message: 'Notification marquée comme lue' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    res.json({ message: 'Toutes les notifications marquées comme lues' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
