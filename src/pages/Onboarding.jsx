import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Sparkles, ArrowRight, ArrowLeft, Check,
  Wallet, CheckSquare, Calendar, Pill
} from 'lucide-react';

const COUNTRIES = [
  { code: 'MA', name: 'Maroc', flag: '\u{1F1F2}\u{1F1E6}', currencies: ['MAD'] },
  { code: 'FR', name: 'France', flag: '\u{1F1EB}\u{1F1F7}', currencies: ['EUR'] },
  { code: 'BE', name: 'Belgique', flag: '\u{1F1E7}\u{1F1EA}', currencies: ['EUR'] },
  { code: 'CH', name: 'Suisse', flag: '\u{1F1E8}\u{1F1ED}', currencies: ['CHF'] },
  { code: 'CA', name: 'Canada', flag: '\u{1F1E8}\u{1F1E6}', currencies: ['CAD'] },
  { code: 'US', name: 'États-Unis', flag: '\u{1F1FA}\u{1F1F8}', currencies: ['USD'] },
  { code: 'GB', name: 'Royaume-Uni', flag: '\u{1F1EC}\u{1F1E7}', currencies: ['GBP'] },
  { code: 'ES', name: 'Espagne', flag: '\u{1F1EA}\u{1F1F8}', currencies: ['EUR'] },
  { code: 'IT', name: 'Italie', flag: '\u{1F1EE}\u{1F1F9}', currencies: ['EUR'] },
  { code: 'DE', name: 'Allemagne', flag: '\u{1F1E9}\u{1F1EA}', currencies: ['EUR'] },
  { code: 'TN', name: 'Tunisie', flag: '\u{1F1F9}\u{1F1F3}', currencies: ['TND'] },
  { code: 'DZ', name: 'Algérie', flag: '\u{1F1E9}\u{1F1FF}', currencies: ['DZD'] },
];

const CURRENCY_INFO = {
  MAD: { symbol: 'DH', label: 'Dirham marocain' },
  EUR: { symbol: '\u20AC', label: 'Euro' },
  USD: { symbol: '$', label: 'Dollar américain' },
  GBP: { symbol: '\u00A3', label: 'Livre sterling' },
  CAD: { symbol: 'CA$', label: 'Dollar canadien' },
  CHF: { symbol: 'Fr', label: 'Franc suisse' },
  TND: { symbol: 'DT', label: 'Dinar tunisien' },
  DZD: { symbol: 'DA', label: 'Dinar algérien' },
};

const Onboarding = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(user?.country || 'MA');
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'MAD');
  const [saving, setSaving] = useState(false);

  const country = COUNTRIES.find((c) => c.code === selectedCountry);
  const availableCurrencies = country?.currencies || ['MAD'];

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/profile', { country: selectedCountry, currency: selectedCurrency, onboarded: true });
      setUser(data.user);
      toast.success('Configuration terminée !');
      navigate('/');
    } catch {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(59,130,246,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_rgba(139,92,246,0.04),transparent_60%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="flex justify-center mb-6">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} animate={{ scale: step === i ? 1.2 : 1, opacity: step >= i ? 1 : 0.3 }}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${step >= i ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-4 shadow-xl shadow-blue-500/25">
                    <Sparkles className="text-white" size={28} />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bienvenue sur SmartLife AI</h1>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Votre assistant intelligent</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-8">
                  {[
                    { icon: Wallet, text: 'Gérez votre budget' },
                    { icon: CheckSquare, text: 'Organisez vos tâches' },
                    { icon: Calendar, text: 'Planifiez vos rendez-vous' },
                    { icon: Pill, text: 'Suivez vos médicaments' },
                  ].map((f, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                      <f.icon size={18} className="text-blue-500 dark:text-blue-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{f.text}</span>
                    </motion.div>
                  ))}
                </div>
                <button onClick={() => setStep(1)}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-sm">
                  Commencer <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="country" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Où vous trouvez-vous ?</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sélectionnez votre pays</p>
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 mb-6">
                  {COUNTRIES.map((c) => (
                    <button key={c.code} onClick={() => { setSelectedCountry(c.code); if (!c.currencies.includes(selectedCurrency)) setSelectedCurrency(c.currencies[0]); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        selectedCountry === c.code
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-medium'
                          : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}>
                      <span className="text-lg">{c.flag}</span>
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(0)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-1">
                    <ArrowLeft size={16} /> Retour
                  </button>
                  <button onClick={() => setStep(2)}
                    className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1 text-sm">
                    Suivant <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="currency" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Votre devise</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Choisissez votre monnaie</p>
                </div>
                <div className="space-y-2 mb-6">
                  {availableCurrencies.map((cur) => {
                    const info = CURRENCY_INFO[cur];
                    return (
                      <button key={cur} onClick={() => setSelectedCurrency(cur)}
                        className={`w-full flex items-center justify-between px-5 py-4 rounded-xl text-sm transition-all ${
                          selectedCurrency === cur
                            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-medium'
                            : 'bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">{info.symbol}</span>
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{cur}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{info.label}</p>
                          </div>
                        </div>
                        {selectedCurrency === cur && <Check size={16} className="text-blue-500" />}
                      </button>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-1">
                    <ArrowLeft size={16} /> Retour
                  </button>
                  <button onClick={handleFinish} disabled={saving}
                    className="flex-[2] py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all text-sm">
                    {saving ? 'Enregistrement...' : 'Terminer'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding;
