import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, Calendar, MapPin, Clock } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Appointments = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', description: '', location: '', priority: 'medium' });

  const { data } = useQuery({
    queryKey: ['appointments'],
    queryFn: () => api.get('/appointments').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/appointments', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Rendez-vous créé'); setShowForm(false); setForm({ title: '', date: '', description: '', location: '', priority: 'medium' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/appointments/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Mis à jour'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/appointments/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['appointments'] }); toast.success('Supprimé'); },
  });

  const appointments = data?.appointments || [];
  const statusConfig = {
    scheduled: { label: 'Planifié', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/30' },
    completed: { label: 'Terminé', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30' },
    cancelled: { label: 'Annulé', color: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' },
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rendez-vous</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Votre agenda</p>
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
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Titre</label>
                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Date</label>
                    <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" required />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Lieu</label>
                    <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Priorité</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm">
                      <option className="bg-white dark:bg-gray-800" value="low">Basse</option>
                      <option className="bg-white dark:bg-gray-800" value="medium">Moyenne</option>
                      <option className="bg-white dark:bg-gray-800" value="high">Haute</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" rows={2} />
                </div>
                <motion.button type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all text-sm">
                  Créer
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucun rendez-vous</p>
          </div>
        ) : (
          appointments.map((apt) => {
            const status = statusConfig[apt.status] || statusConfig.scheduled;
            return (
              <motion.div key={apt._id} variants={itemVariants} whileHover={{ y: -1 }}
                className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-gray-900 dark:text-white font-medium">{apt.title}</h3>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(apt.date).toLocaleDateString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}</span>
                      {apt.location && <span className="flex items-center gap-1"><MapPin size={12} /> {apt.location}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <select value={apt.status} onChange={(e) => updateMutation.mutate({ id: apt._id, data: { status: e.target.value } })}
                      className="px-2 py-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400 focus:outline-none">
                      <option className="bg-white dark:bg-gray-800" value="scheduled">Planifié</option>
                      <option className="bg-white dark:bg-gray-800" value="completed">Terminé</option>
                      <option className="bg-white dark:bg-gray-800" value="cancelled">Annulé</option>
                    </select>
                    <button onClick={() => deleteMutation.mutate(apt._id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
};

export default Appointments;
