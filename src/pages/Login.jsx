import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import PasswordInput from '../components/PasswordInput';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', rememberMe: false });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Veuillez remplir tous les champs');
    setLoading(true);
    try {
      await login(form.email, form.password, form.rememberMe);
      toast.success('Connexion réussie');
      navigate('/');
    } catch (error) {
      const msg = error.response?.data?.message;
      if (error.response?.data?.errors) {
        toast.error(error.response.data.errors[0]?.msg || 'Données invalides');
      } else {
        toast.error(msg || 'Erreur de connexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06),transparent_50%)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">SmartLife AI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Connectez-vous à votre espace personnel</p>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm"
                  placeholder="votre@email.com" required />
              </div>
            </div>
            <PasswordInput id="login-password" label="Mot de passe" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                <input type="checkbox" checked={form.rememberMe} onChange={(e) => setForm({ ...form, rememberMe: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-blue-500 focus:ring-blue-500/30" />
                Se souvenir
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-medium transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Se connecter <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-semibold transition-colors">
            Créer un compte
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
