import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import toast from 'react-hot-toast';
import ImageCropModal from '../components/ImageCropModal';
import { getCroppedImg } from '../utils/cropImage';
import {
  User, Award, Gift, Shield, Camera, Edit3, Save, Copy, Check,
  Stethoscope, Hospital, FlaskConical, LogIn, CheckSquare, Wallet,
  Star, Brain, Users, TrendingUp, ClipboardCheck
} from 'lucide-react';

const EARN_ACTIONS = [
  { id: 'medical_visit', label: 'Visite médecin', points: 600, icon: Stethoscope, color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 dark:text-blue-400' },
  { id: 'specialist_visit', label: 'Spécialiste', points: 1000, icon: Hospital, color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-500 dark:text-violet-400' },
  { id: 'specialty_choose', label: 'Choix spécialité', points: 200, icon: FlaskConical, color: 'bg-pink-50 dark:bg-pink-500/10 text-pink-500 dark:text-pink-400' },
  { id: 'daily_login', label: 'Connexion quotidienne', points: 50, icon: LogIn, color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' },
  { id: 'complete_task', label: 'Tâche complétée', points: 25, icon: CheckSquare, color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400' },
  { id: 'add_transaction', label: 'Transaction ajoutée', points: 10, icon: Wallet, color: 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-500 dark:text-cyan-400' },
];

const REWARDS = [
  { id: 'medical_free', label: 'Consultation gratuite', points: 2000, icon: Hospital, color: 'text-blue-500 dark:text-blue-400' },
  { id: 'coaching', label: 'Séance coaching', points: 3000, icon: Brain, color: 'text-violet-500 dark:text-violet-400' },
  { id: 'premium_reduce', label: 'Réduction Premium', points: 5000, icon: Star, color: 'text-amber-500 dark:text-amber-400' },
  { id: 'health_cert', label: 'Attestation santé', points: 1500, icon: ClipboardCheck, color: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'ai_report', label: 'Rapport IA', points: 1000, icon: Brain, color: 'text-pink-500 dark:text-pink-400' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');
  const [referralCopied, setReferralCopied] = useState(false);
  const [cropModal, setCropModal] = useState({ open: false, imageSrc: null });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty'],
    queryFn: () => api.get('/loyalty').then((r) => r.data),
  });

  const { data: referralData } = useQuery({
    queryKey: ['referral'],
    queryFn: () => api.get('/referral/code').then((r) => r.data),
  });

  const earnMutation = useMutation({
    mutationFn: (action) => api.post('/loyalty/earn', { action }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['loyalty'] });
      toast.success(`+${res.data.pointsEarned} points gagnés !`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image trop grande (max 5MB)');
    const reader = new FileReader();
    reader.onload = () => setCropModal({ open: true, imageSrc: reader.result });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = useCallback(async (pixelCrop) => {
    if (!cropModal.imageSrc) return;
    try {
      const blob = await getCroppedImg(cropModal.imageSrc, pixelCrop);
      const formData = new FormData();
      formData.append('avatar', blob, 'avatar.jpg');
      const { data } = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.user);
      toast.success('Photo mise à jour');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur upload');
    } finally {
      setCropModal({ open: false, imageSrc: null });
    }
  }, [cropModal.imageSrc, setUser]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put('/profile', form);
      setUser(data.user);
      toast.success('Profil mis à jour');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Les mots de passe ne correspondent pas');
    try {
      await api.put('/change-password', { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Mot de passe modifié');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const copyReferral = () => {
    if (referralData?.link) {
      navigator.clipboard.writeText(referralData.link);
      setReferralCopied(true);
      toast.success('Lien copié !');
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

  const points = loyaltyData?.points || user?.loyaltyPoints || 0;
  const history = loyaltyData?.history || user?.pointsHistory || [];
  const referralCode = referralData?.code || user?.referralCode || '';
  const referralLink = referralData?.link || '';

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'points', label: 'Points', icon: Award },
    { id: 'referral', label: 'Parrainage', icon: Gift },
    { id: 'password', label: 'Sécurité', icon: Shield },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mon Profil</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Gérez votre espace personnel</p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <motion.div variants={itemVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Informations personnelles</h2>
            <button onClick={() => setEditing(!editing)}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center gap-1.5 font-medium">
              <Edit3 size={14} /> {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => fileInputRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user?.name?.[0] || '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={20} className="text-white" />
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
            <div>
              <p className="text-gray-900 dark:text-white font-medium">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="px-2 py-0.5 text-xs rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium capitalize">{user?.role}</span>
                <span className="px-2 py-0.5 text-xs rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1"><Award size={11} /> {points} pts</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {[
              { key: 'name', label: 'Nom', type: 'text' },
              { key: 'phone', label: 'Téléphone', type: 'tel' },
              { key: 'address', label: 'Adresse', type: 'text' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  disabled={!editing}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-50 transition-all text-sm" />
              </div>
            ))}
            {editing && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleSave} disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 text-sm flex items-center justify-center gap-2">
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Points Tab */}
      {tab === 'points' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-500/10 dark:to-amber-500/5 rounded-2xl p-6 border border-amber-200 dark:border-amber-500/20 text-center">
            <Award size={32} className="mx-auto text-amber-500 mb-2" />
            <p className="text-amber-600 dark:text-amber-400 text-sm font-medium">Points de fidélité</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">{points}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Gagner des points</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {EARN_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button key={action.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => earnMutation.mutate(action.id)}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm font-medium truncate">{action.label}</p>
                      <p className="text-amber-500 dark:text-amber-400 text-xs font-bold">+{action.points}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4 text-sm flex items-center gap-2"><Gift size={16} className="text-violet-500" /> Récompenses</h3>
            <div className="space-y-2">
              {REWARDS.map((reward) => {
                const Icon = reward.icon;
                return (
                  <div key={reward.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl">
                    <Icon size={18} className={reward.color} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-white text-sm font-medium">{reward.label}</p>
                    </div>
                    <span className={`text-sm font-bold ${points >= reward.points ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'}`}>
                      {reward.points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Referral Tab */}
      {tab === 'referral' && (
        <motion.div variants={itemVariants} className="space-y-4">
          <div className="bg-gradient-to-br from-violet-50 to-pink-50 dark:from-violet-500/10 dark:to-pink-500/5 rounded-2xl p-6 border border-violet-200 dark:border-violet-500/20 text-center">
            <Gift size={32} className="mx-auto text-violet-500 mb-2" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Parrainez vos amis</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gagnez <span className="text-amber-500 font-bold">500 points</span> par ami</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1.5">Code de parrainage</label>
              <div className="flex gap-2">
                <input readOnly value={referralCode}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white font-mono text-lg text-center tracking-wider" />
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => { navigator.clipboard.writeText(referralCode); toast.success('Code copié !'); }}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium flex items-center gap-1.5">
                  <Copy size={14} /> Copier
                </motion.button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1.5">Lien d'invitation</label>
              <div className="flex gap-2">
                <input readOnly value={referralLink}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white text-sm truncate" />
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={copyReferral}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${referralCopied ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'}`}>
                  {referralCopied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Partager</>}
                </motion.button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: 'Amis', value: user?.referralsCount || 0, icon: Users, color: 'text-blue-500' },
                { label: 'Points', value: (user?.referralsCount || 0) * 500, icon: Award, color: 'text-amber-500' },
                { label: 'Statut', value: 'Actif', icon: Check, color: 'text-emerald-500' },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <Icon size={18} className={`mx-auto ${s.color}`} />
                    <p className="text-gray-900 dark:text-white font-bold mt-1">{s.value}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <motion.div variants={itemVariants}
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2"><Shield size={18} /> Changer le mot de passe</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Mot de passe actuel' },
              { key: 'newPassword', label: 'Nouveau mot de passe' },
              { key: 'confirmPassword', label: 'Confirmer' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm text-gray-500 dark:text-gray-400 block mb-1.5">{label}</label>
                <input type="password" value={passwordForm[key]}
                  onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm" />
              </div>
            ))}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 text-sm">
              Modifier
            </motion.button>
          </form>
        </motion.div>
      )}

      {cropModal.open && (
        <ImageCropModal
          imageSrc={cropModal.imageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropModal({ open: false, imageSrc: null })}
        />
      )}
    </motion.div>
  );
};

export default Profile;
