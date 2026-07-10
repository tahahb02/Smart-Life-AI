import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = Router();

// GET /api/referral/code - Get user's referral code and link
router.get('/code', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode');
    const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/register?ref=${user.referralCode}`;
    res.json({ referralCode: user.referralCode, link });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/referral/stats - Get referral stats
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('referralCode referralsCount');
    const referrals = await User.find({ referredBy: req.user._id }).select('name email createdAt');
    const earnings = referrals.length * 500;
    res.json({ referralCode: user.referralCode, referralsCount: user.referralsCount, referrals, earnings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/referral/apply - Apply a referral code
router.post('/apply', protect, async (req, res) => {
  try {
    const { referralCode } = req.body;
    if (!referralCode) return res.status(400).json({ message: 'Code de parrainage requis' });
    if (req.user.referredBy) return res.status(400).json({ message: 'Code de parrainage déjà appliqué' });

    const referrer = await User.findOne({ referralCode });
    if (!referrer) return res.status(404).json({ message: 'Code de parrainage invalide' });
    if (referrer._id.toString() === req.user._id.toString()) return res.status(400).json({ message: 'Impossible de se parrainer soi-même' });

    req.user.referredBy = referrer._id;
    await req.user.save();

    referrer.referralsCount += 1;
    referrer.loyaltyPoints += 500;
    referrer.pointsHistory.push({ type: 'referral_bonus', amount: 500, description: `Parrainage de ${req.user.name}` });
    await referrer.save();

    res.json({ message: 'Code de parrainage appliqué avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
