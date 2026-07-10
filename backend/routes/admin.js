import { Router } from 'express';
import { protect, authorize, verifiedOnly } from '../middlewares/auth.js';
import User from '../models/User.js';
import Log from '../models/Log.js';
import AIHistory from '../models/AIHistory.js';
import Chat from '../models/Chat.js';
import Transaction from '../models/Transaction.js';

const router = Router();

router.get('/stats', protect, authorize('admin'), verifiedOnly, async (req, res) => {
  try {
    const [totalUsers, verifiedUsers, totalChats, totalTransactions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Chat.countDocuments(),
      Transaction.countDocuments(),
    ]);

    res.json({
      totalUsers, verifiedUsers, pendingVerification: totalUsers - verifiedUsers,
      totalChats, totalTransactions,
      activeUsers: await User.countDocuments({ isActive: true }),
      premiumUsers: await User.countDocuments({ role: 'premium' }),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/logs', protect, authorize('admin'), verifiedOnly, async (req, res) => {
  try {
    const { page = 1, limit = 50, level } = req.query;
    const query = {};
    if (level) query.level = level;

    const logs = await Log.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Log.countDocuments(query);
    res.json({ logs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/ai-usage', protect, authorize('admin'), verifiedOnly, async (req, res) => {
  try {
    const usage = await AIHistory.aggregate([
      { $group: { _id: '$provider', count: { $sum: 1 }, totalTokens: { $sum: '$tokensUsed' } } },
    ]);
    res.json({ usage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
