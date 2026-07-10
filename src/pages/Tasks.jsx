import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, X, Trash2, CheckCircle, Circle, Clock, AlertTriangle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const Tasks = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', deadline: '' });
  const [filter, setFilter] = useState('all');

  const { data } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => api.get('/tasks', { params: filter !== 'all' ? { status: filter } : {} }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/tasks', data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tâche créée'); setShowForm(false); setForm({ title: '', description: '', priority: 'medium', deadline: '' }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/tasks/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tâche mise à jour'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Tâche supprimée'); },
  });

  const tasks = data?.tasks || [];
  const statuses = ['all', 'todo', 'in_progress', 'done'];
  const statusLabels = { all: 'Toutes', todo: 'À faire', in_progress: 'En cours', done: 'Terminées' };
  const priorityConfig = {
    low: { label: 'Basse', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
    medium: { label: 'Moyenne', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    high: { label: 'Haute', color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' },
    urgent: { label: 'Urgente', color: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400' },
  };

  return (
    <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
      <motion.div className="flex items-center justify-between" variants={itemVariants}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tâches</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gérez vos tâches quotidiennes</p>
        </div>
        <motion.button onClick={() => setShowForm(!showForm)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2">
          {showForm ? <><X size={16} /> Annuler</> : <><Plus size={16} /> Ajouter</>}
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === s ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}>
            {statusLabels[s]}
          </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
              <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Titre</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Priorité</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm">
                      <option className="bg-white dark:bg-gray-800" value="low">Basse</option>
                      <option className="bg-white dark:bg-gray-800" value="medium">Moyenne</option>
                      <option className="bg-white dark:bg-gray-800" value="high">Haute</option>
                      <option className="bg-white dark:bg-gray-800" value="urgent">Urgente</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1.5">Date limite</label>
                    <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all text-sm" />
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

      <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">Aucune tâche</p>
          </div>
        ) : (
          tasks.map((task) => (
            <motion.div key={task._id} variants={itemVariants} whileHover={{ y: -1 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <button onClick={() => updateMutation.mutate({ id: task._id, data: { status: task.status === 'done' ? 'todo' : 'done' } })}
                  className="flex-shrink-0">
                  {task.status === 'done' ? (
                    <CheckCircle size={22} className="text-emerald-500" />
                  ) : (
                    <Circle size={22} className="text-gray-300 dark:text-gray-600 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {task.title}
                  </p>
                  <div className="flex gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${priorityConfig[task.priority]?.color}`}>
                      {priorityConfig[task.priority]?.label}
                    </span>
                    {task.deadline && (
                      <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                        <Clock size={11} /> {new Date(task.deadline).toLocaleDateString('fr-FR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select value={task.status} onChange={(e) => updateMutation.mutate({ id: task._id, data: { status: e.target.value } })}
                  className="px-2 py-1 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400 focus:outline-none">
                  <option className="bg-white dark:bg-gray-800" value="todo">À faire</option>
                  <option className="bg-white dark:bg-gray-800" value="in_progress">En cours</option>
                  <option className="bg-white dark:bg-gray-800" value="done">Terminée</option>
                </select>
                <button onClick={() => deleteMutation.mutate(task._id)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
};

export default Tasks;
