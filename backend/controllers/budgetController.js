import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

export const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, category, startDate, endDate, sort = '-date' } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort(sort).limit(limit * 1).skip((page - 1) * limit);
    const total = await Transaction.countDocuments(query);

    res.json({ transactions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!transaction) return res.status(404).json({ message: 'Transaction non trouvée' });
    res.json({ message: 'Transaction supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ budgets });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createBudget = async (req, res) => {
  try {
    const budget = await Budget.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });
    res.json({ budget });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget non trouvé' });
    res.json({ message: 'Budget supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBudgetAnalysis = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      userId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).sort({ date: -1 });

    const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);

    const subscriptions = transactions.filter((t) => t.isRecurring);
    const byCategory = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    const byCategoryIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      subscriptions,
      byCategory,
      byCategoryIncome,
      trends: [],
      period: { start: startOfMonth, end: endOfMonth },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
