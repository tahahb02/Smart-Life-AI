import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import User from '../models/User.js';

const router = Router();

const POINTS_RULES = {
  medical_visit: { points: 600, description: 'Consultation médecin généraliste' },
  specialist_visit: { points: 1000, description: 'Consultation médecin spécialiste' },
  daily_login: { points: 50, description: 'Connexion quotidienne' },
  complete_task: { points: 25, description: 'Tâche complétée' },
  budget_transaction: { points: 10, description: 'Transaction budgétaire ajoutée' },
  refer_friend: { points: 500, description: 'Parrainage d\'un ami' },
};

const REWARDS_CATALOG = [
  { id: 'consultation_gratuite', name: 'Consultation médicale gratuite', cost: 2000, description: 'Une consultation médicale offerte' },
  { id: 'seance_coaching', name: 'Séance coaching 10 min', cost: 3000, description: '10 minutes de coaching personnalisé' },
  { id: 'reduction_premium', name: 'Réduction premium', cost: 5000, description: 'Réduction sur l\'abonnement premium' },
  { id: 'attestation_sante', name: 'Attestation santé', cost: 1500, description: 'Attestation de suivi santé' },
  { id: 'rapport_ia', name: 'Rapport IA personnalisé', cost: 1000, description: 'Rapport d\'analyse IA personnalisé' },
];

// GET /api/loyalty - Get user's points and history
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints pointsHistory');
    res.json({ loyaltyPoints: user.loyaltyPoints, pointsHistory: user.pointsHistory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/loyalty/earn - Earn points for a specific action
router.post('/earn', protect, async (req, res) => {
  try {
    const { action } = req.body;
    const rule = POINTS_RULES[action];
    if (!rule) return res.status(400).json({ message: 'Action inconnue' });

    const user = await User.findById(req.user._id);
    user.loyaltyPoints += rule.points;
    user.pointsHistory.push({ type: 'earned', amount: rule.points, description: rule.description });
    await user.save();

    res.json({ loyaltyPoints: user.loyaltyPoints, earned: rule.points, description: rule.description });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/loyalty/rewards - List available rewards
router.get('/rewards', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('loyaltyPoints');
    const rewards = REWARDS_CATALOG.map(r => ({ ...r, affordable: user.loyaltyPoints >= r.cost }));
    res.json({ loyaltyPoints: user.loyaltyPoints, rewards });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/loyalty/redeem/:rewardId - Redeem a reward
router.post('/redeem/:rewardId', protect, async (req, res) => {
  try {
    const reward = REWARDS_CATALOG.find(r => r.id === req.params.rewardId);
    if (!reward) return res.status(404).json({ message: 'Récompense introuvable' });

    const user = await User.findById(req.user._id);
    if (user.loyaltyPoints < reward.cost) {
      return res.status(400).json({ message: 'Points insuffisants', required: reward.cost, current: user.loyaltyPoints });
    }

    user.loyaltyPoints -= reward.cost;
    user.pointsHistory.push({ type: 'spent', amount: reward.cost, description: `Récompense: ${reward.name}` });
    await user.save();

    res.json({ message: 'Récompense échangée', loyaltyPoints: user.loyaltyPoints, reward });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
