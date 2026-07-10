import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';
import {
  TrendingUp, TrendingDown, Wallet, Plus, X, Trash2,
  Utensils, Car, Home, Gamepad2, Heart, BookOpen, ShoppingBag,
  DollarSign, Briefcase, BarChart3, Package
} from 'lucide-react';

const CATEGORY_CONFIG = {
  Alimentation: { icon: Utensils, color: 'text-orange-500 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  Transport: { icon: Car, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  Logement: { icon: Home, color: 'text-violet-500 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
  Loisirs: { icon: Gamepad2, color: 'text-pink-500 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10' },
  'Santé': { icon: Heart, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
  Éducation: { icon: BookOpen, color: 'text-indigo-500 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  Shopping: { icon: ShoppingBag, color: 'text-fuchsia-500 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10' },
  Salaire: { icon: DollarSign, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  Freelance: { icon: Briefcase, color: 'text-cyan-500 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  Investissement: { icon: BarChart3, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10' },
  Autre: { icon: Package, color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Budget = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'MAD';
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Alimentation', description: '', date: new Date().toISOString().split('T')[0] });

  const { data: transactionsData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get('/budget/transactions').then((r) => r.data),
  });

  const { data: analysis } = useQuery({
    queryKey: ['budget-analysis'],
    queryFn: () => api.get('/budget/analysis').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/budget/transactions', { ...data, amount: parseFloat(data.amount) || 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction ajoutée');
      setShowForm(false);
      setForm({ type: 'expense', amount: '', category: 'Alimentation', description: '', date: new Date().toISOString().split('T')[0] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budget/transactions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['budget-analysis'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Transaction supprimée');
    },
  });

  const transactions = transactionsData?.transactions || [];
  const categories = Object.keys(CATEGORY_CONFIG);

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos finances en <span className="text-blue-500 dark:text-blue-400 font-medium">{currency}</span></p>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
          {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
        </motion.button>
      </motion.div>

      {analysis && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Revenus', value: analysis.totalIncome, icon: TrendingUp, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Dépenses', value: analysis.totalExpense, icon: TrendingDown, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
            { label: 'Solde', value: analysis.balance, icon: Wallet, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} whileHover={{ y: -2 }}
                className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(card.value, currency)}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <Icon size={20} className={card.color} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Type</label>
                    <div className="flex gap-2">
                      {['income', 'expense'].map((t) => (
                        <button key={t} type="button" onClick={() => setForm({ ...form, type: t })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            form.type === t
                              ? t === 'income' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                              : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}>
                          {t === 'income' ? 'Revenu' : 'Dépense'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Montant ({currency})</label>
                    <input type="number" step="0.01" min="0" value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Catégorie</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm">
                      {categories.map((c) => <option key={c} className="bg-white dark:bg-gray-800" value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Date</label>
                    <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                  <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm" placeholder="Optionnelle" />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all text-sm">
                  Ajouter
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Transactions</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune transaction ce mois-ci</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {transactions.map((t) => {
              const config = CATEGORY_CONFIG[t.category] || CATEGORY_CONFIG.Autre;
              const Icon = config.icon;
              return (
                <motion.div key={t._id} whileHover={{ backgroundColor: 'rgba(0,0,0,0.01)' }}
                  className="p-4 flex items-center justify-between">
                   <div className="flex items-center gap-3 flex-1 min-w-0">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg}`}>
                       <Icon size={18} className={config.color} />
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{t.category}</p>
                       <p className="text-gray-400 dark:text-gray-500 text-xs truncate">{t.description || new Date(t.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                    </span>
                    <button onClick={() => deleteMutation.mutate(t._id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Budget;
