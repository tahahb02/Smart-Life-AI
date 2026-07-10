import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KeyRound, ArrowRight, Lock } from 'lucide-react';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return toast.error('Les mots de passe ne correspondent pas');
    if (password.length < 8) return toast.error('Minimum 8 caractères');
    setSubmitting(true);
    try {
      await api.post('/auth/reset-password', { password, token });
      toast.success('Mot de passe réinitialisé !');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06),transparent_50%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
            <KeyRound className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Nouveau mot de passe</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Choisissez un mot de passe sécurisé</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                  placeholder="Min. 8 caractères" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Confirmer</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                  placeholder="Confirmez" required />
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitting}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm">
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Réinitialiser <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
            ← Retour à la connexion
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
