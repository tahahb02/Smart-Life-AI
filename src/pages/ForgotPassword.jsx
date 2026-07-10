import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../api/axios';
import toast from 'react-hot-toast';
import { KeyRound, ArrowRight, Mail, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Email de réinitialisation envoyé');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Mot de passe oublié</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Nous vous enverrons un lien de réinitialisation</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.form key="form" onSubmit={handleSubmit} className="space-y-5"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, x: -20 }}>
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                      placeholder="votre@email.com" required />
                  </div>
                </div>
                <motion.button type="submit" disabled={loading}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Réinitialiser <ArrowRight size={16} /></>
                  )}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-4">
                  <CheckCircle className="text-emerald-500" size={28} />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">Email envoyé !</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Vérifiez votre boîte de réception</p>
              </motion.div>
            )}
          </AnimatePresence>
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

export default ForgotPassword;
