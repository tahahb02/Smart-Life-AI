import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Pill, Clock, Calendar, Activity } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Medicines = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', frequency: '', times: '', startDate: new Date().toISOString().split('T')[0], notes: '' });

  const { data } = useQuery({
    queryKey: ['medicines'],
    queryFn: () => api.get('/medicines').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/medicines', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Médicament ajouté'); setShowForm(false); setForm({ name: '', dosage: '', frequency: '', times: '', startDate: '', notes: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/medicines/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicines'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/medicines/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicines'] }); toast.success('Supprimé'); },
  });

  const medicines = data?.medicines || [];

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Médicaments</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez votre traitement</p>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
          {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ ...form, times: form.times.split(',').map((t) => t.trim()).filter(Boolean) }); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Nom</label>
                    <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Dosage</label>
                    <input type="text" value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" placeholder="ex: 500mg" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Fréquence</label>
                    <input type="text" value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" placeholder="ex: 2x par jour" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Heures (virgules)</label>
                    <input type="text" value={form.times} onChange={(e) => setForm({ ...form, times: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" placeholder="08:00,20:00" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Date de début</label>
                    <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" rows={2} />
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

      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={containerVariants} initial="hidden" animate="visible">
        {medicines.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Pill size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun médicament</p>
          </div>
        ) : (
          medicines.map((m) => (
            <motion.div key={m._id} variants={itemVariants} whileHover={{ y: -3 }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <Pill size={18} className="text-blue-500 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold text-sm">{m.name}</h3>
                    <p className="text-blue-500 dark:text-blue-400 text-xs">{m.dosage}</p>
                  </div>
                </div>
                <button onClick={() => toggleMutation.mutate({ id: m._id, data: { active: !m.active } })}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${m.active ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                  {m.active ? 'Actif' : 'Inactif'}
                </button>
              </div>
              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                {m.frequency && <p className="flex items-center gap-1.5"><Activity size={11} /> {m.frequency}</p>}
                {m.times?.length > 0 && <p className="flex items-center gap-1.5"><Clock size={11} /> {m.times.join(', ')}</p>}
                {m.startDate && <p className="flex items-center gap-1.5"><Calendar size={11} /> {new Date(m.startDate).toLocaleDateString('fr-FR')}</p>}
              </div>
              <button onClick={() => deleteMutation.mutate(m._id)}
                className="mt-3 text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1">
                <Trash2 size={12} /> Supprimer
              </button>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default Medicines;
