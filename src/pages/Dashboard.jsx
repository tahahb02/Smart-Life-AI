import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { formatCurrency } from '../utils/helpers';
import { TrendingUp, TrendingDown, Banknote, CheckSquare, Calendar, Pill } from 'lucide-react';

const statCards = [
  { label: 'Revenus du mois', key: 'monthlyIncome', icon: TrendingUp, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Dépenses du mois', key: 'monthlyExpense', icon: TrendingDown, color: 'from-red-500 to-rose-600', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
  { label: 'Solde du mois', key: 'monthlyBalance', icon: Banknote, color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  { label: 'Tâches en cours', key: 'pendingTasks', icon: CheckSquare, color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-400' },
  { label: 'Rendez-vous', key: 'upcomingAppointments', icon: Calendar, color: 'from-cyan-500 to-teal-600', bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-600 dark:text-cyan-400' },
  { label: 'Médicaments', key: 'activeMedicines', icon: Pill, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const Dashboard = () => {
  const { user } = useAuth();
  const currency = user?.currency || 'MAD';

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then((r) => r.data),
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
          Bonjour, {user?.name}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          <span className="mx-2 text-gray-300 dark:text-gray-600">·</span>
          <span className="text-blue-500 dark:text-blue-400 font-medium">{currency}</span>
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          const isCurrency = ['monthlyIncome', 'monthlyExpense', 'monthlyBalance'].includes(card.key);
          return (
            <motion.div key={i} whileHover={{ y: -3, scale: 1.01 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{card.label}</p>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {isLoading ? (
                      <span className="inline-block w-20 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse" />
                    ) : isCurrency ? (
                      formatCurrency(stats?.[card.key], currency)
                    ) : (
                      stats?.[card.key] ?? '0'
                    )}
                  </motion.p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={20} className={card.text} />
                </div>
              </div>
              {isCurrency && <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">Ce mois-ci</p>}
            </motion.div>
          );
        })}
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            Activité récente
          </h2>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune activité récente</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500" />
            Citation du jour
          </h2>
          <blockquote className="text-gray-600 dark:text-gray-300 italic text-lg leading-relaxed">
            "Le secret pour avancer est de commencer."
          </blockquote>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">— Mark Twain</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
