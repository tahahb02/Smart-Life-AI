import User from '../models/User.js';

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isVerified } = req.query;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, phone, address, language, timezone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, address, language, timezone },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, language, timezone, aiPreferences, country, currency, onboarded } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (language !== undefined) updates.language = language;
    if (timezone !== undefined) updates.timezone = timezone;
    if (aiPreferences !== undefined) updates.aiPreferences = aiPreferences;
    if (country !== undefined) updates.country = country;
    if (currency !== undefined) updates.currency = currency;
    if (onboarded !== undefined) updates.onboarded = onboarded;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isActive: false, deletedAt: new Date() });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json({ message: 'Compte désactivé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Mot de passe changé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const Transaction = (await import('../models/Transaction.js')).default;
    const Task = (await import('../models/Task.js')).default;
    const Appointment = (await import('../models/Appointment.js')).default;
    const Medicine = (await import('../models/Medicine.js')).default;
    const Budget = (await import('../models/Budget.js')).default;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [incomeResult, expenseResult, pendingTasks, upcomingAppointments, activeMedicines] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId, date: { $gte: startOfMonth }, type: 'income' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId, date: { $gte: startOfMonth }, type: 'expense' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Task.countDocuments({ userId, status: { $in: ['todo', 'in_progress'] } }),
      Appointment.countDocuments({ userId, date: { $gte: now }, status: 'scheduled' }),
      Medicine.countDocuments({ userId, active: true }),
    ]);

    const monthlyIncome = incomeResult[0]?.total || 0;
    const monthlyExpense = expenseResult[0]?.total || 0;

    res.json({
      monthlyIncome,
      monthlyExpense,
      monthlyBalance: monthlyIncome - monthlyExpense,
      pendingTasks,
      upcomingAppointments,
      activeMedicines,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
