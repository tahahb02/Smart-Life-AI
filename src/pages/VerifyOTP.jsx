import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShieldCheck, ArrowRight } from 'lucide-react';

const VerifyOTP = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(600);
  const [loading, setLoading] = useState(false);
  const { user, verifyOTP, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isVerified) navigate('/');
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, user, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length !== 6) return toast.error('Entrez le code à 6 chiffres');
    setLoading(true);
    try {
      await verifyOTP(otp);
      toast.success('Compte vérifié !');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Code invalide');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOTP();
      setTimer(600);
      toast.success('Nouveau code envoyé');
    } catch {
      toast.error("Erreur lors de l'envoi");
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06),transparent_50%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Vérification</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Code envoyé à {user?.email}</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center mb-6">Temps restant : {formatTime(timer)}</p>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-3 justify-center mb-6">
              {code.map((digit, i) => (
                <motion.input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  whileFocus={{ scale: 1.05, borderColor: 'rgba(59,130,246,0.5)' }}
                  className="w-12 h-14 text-center text-xl font-bold bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
              ))}
            </div>
            <motion.button type="submit" disabled={loading || timer === 0}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm mb-4">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Vérifier <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
          <button onClick={handleResend} disabled={timer > 0}
            className="w-full text-center text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-600 text-sm font-medium transition-colors">
            Renvoyer le code
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
