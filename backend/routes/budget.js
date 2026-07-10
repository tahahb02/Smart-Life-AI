import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import {
  getTransactions, createTransaction, updateTransaction, deleteTransaction,
  getBudgets, createBudget, updateBudget, deleteBudget, getBudgetAnalysis,
} from '../controllers/budgetController.js';

const router = Router();

router.get('/transactions', protect, verifiedOnly, getTransactions);
router.post('/transactions', protect, verifiedOnly, createTransaction);
router.put('/transactions/:id', protect, verifiedOnly, updateTransaction);
router.delete('/transactions/:id', protect, verifiedOnly, deleteTransaction);

router.get('/budgets', protect, verifiedOnly, getBudgets);
router.post('/budgets', protect, verifiedOnly, createBudget);
router.put('/budgets/:id', protect, verifiedOnly, updateBudget);
router.delete('/budgets/:id', protect, verifiedOnly, deleteBudget);

router.get('/analysis', protect, verifiedOnly, getBudgetAnalysis);

export default router;
