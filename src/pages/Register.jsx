import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import toast from 'react-hot-toast';
import { Sparkles, ArrowRight, UserPlus, Mail, Phone, User, Check } from 'lucide-react';

const PASSWORD_RULES = {
  min: 8, hasLower: /[a-z]/, hasUpper: /[A-Z]/, hasDigit: /\d/, hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

const getPasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (PASSWORD_RULES.hasLower.test(pwd)) score++;
  if (PASSWORD_RULES.hasUpper.test(pwd)) score++;
  if (PASSWORD_RULES.hasDigit.test(pwd)) score++;
  if (PASSWORD_RULES.hasSpecial.test(pwd)) score++;
  if (score <= 2) return { label: 'Faible', color: 'bg-red-500', textColor: 'text-red-500', width: 33 };
  if (score <= 4) return { label: 'Moyen', color: 'bg-amber-500', textColor: 'text-amber-500', width: 66 };
  return { label: 'Fort', color: 'bg-emerald-500', textColor: 'text-emerald-500', width: 100 };
};

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', verifyMethod: 'email' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (form.password.length < 8) errs.password = 'Minimum 8 caractères';
    else if (!PASSWORD_RULES.hasLower.test(form.password)) errs.password = 'Doit contenir une minuscule';
    else if (!PASSWORD_RULES.hasUpper.test(form.password)) errs.password = 'Doit contenir une majuscule';
    else if (!PASSWORD_RULES.hasDigit.test(form.password)) errs.password = 'Doit contenir un chiffre';
    else if (!PASSWORD_RULES.hasSpecial.test(form.password)) errs.password = 'Doit contenir un caractère spécial';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, verifyMethod: form.verifyMethod });
      toast.success('Inscription réussie ! Vérifiez votre code OTP.');
      navigate('/verify-otp');
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors) data.errors.forEach((err) => toast.error(err.msg));
      else toast.error(data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const strength = form.password ? getPasswordStrength(form.password) : null;
  const requirements = [
    { label: '8 caractères minimum', met: form.password.length >= 8 },
    { label: 'Minuscule (a-z)', met: PASSWORD_RULES.hasLower.test(form.password) },
    { label: 'Majuscule (A-Z)', met: PASSWORD_RULES.hasUpper.test(form.password) },
    { label: 'Chiffre (0-9)', met: PASSWORD_RULES.hasDigit.test(form.password) },
    { label: 'Caractère spécial (!@#...)', met: PASSWORD_RULES.hasSpecial.test(form.password) },
  ];

  const fields = [
    { key: 'name', label: 'Nom complet', type: 'text', icon: User, placeholder: 'Jean Dupont' },
    { key: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'votre@email.com', required: true },
    { key: 'phone', label: 'Téléphone (optionnel)', type: 'tel', icon: Phone, placeholder: '+33612345678' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-gray-50 dark:bg-gray-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(139,92,246,0.06),transparent_50%)]" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }} className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
            <UserPlus className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Créer un compte</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Rejoignez SmartLife AI</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, icon: Icon, placeholder, required }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">{label}</label>
                <div className="relative">
                  <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm"
                    placeholder={placeholder} required={required} />
                </div>
                {errors[key] && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Vérification</label>
              <select value={form.verifyMethod} onChange={(e) => setForm({ ...form, verifyMethod: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm">
                <option value="email" className="bg-white dark:bg-gray-800">Email</option>
                <option value="whatsapp" className="bg-white dark:bg-gray-800">WhatsApp</option>
              </select>
            </div>

            <PasswordInput id="reg-password" label="Mot de passe" value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: '' }); }}
              placeholder="Min. 8 caractères" error={errors.password} />

            {form.password && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: `${strength.width}%` }} />
                  </div>
                  <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {requirements.map((r, i) => (
                    <div key={i} className={`text-xs flex items-center gap-1.5 ${r.met ? 'text-emerald-500' : 'text-gray-400 dark:text-gray-500'}`}>
                      {r.met ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600" />}
                      {r.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            <PasswordInput id="reg-confirm" label="Confirmer le mot de passe" value={form.confirmPassword}
              onChange={(e) => { setForm({ ...form, confirmPassword: e.target.value }); setErrors({ ...errors, confirmPassword: '' }); }}
              placeholder="Confirmez votre mot de passe" error={errors.confirmPassword} />

            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Créer mon compte <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
        </motion.div>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-semibold transition-colors">
            Se connecter
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Register;
