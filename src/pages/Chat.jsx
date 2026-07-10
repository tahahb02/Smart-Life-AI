import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { MessageCircle, Send, Plus, Bot, Sparkles } from 'lucide-react';

const Chat = () => {
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const { data: chatsData, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: () => api.get('/chat').then((r) => r.data),
  });

  const createChat = useMutation({
    mutationFn: () => api.post('/chat'),
    onSuccess: (res) => {
      setActiveChat(res.data.chat._id);
      setMessages(res.data.welcomeMessage ? [res.data.welcomeMessage] : []);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  const loadMessages = async (chatId) => {
    if (!chatId) return;
    const { data } = await api.get(`/chat/${chatId}/messages`);
    setMessages(data.messages);
  };

  useEffect(() => { if (activeChat) loadMessages(activeChat); }, [activeChat]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeChat || sending) return;
    setSending(true);
    const tempId = Date.now().toString();
    const userMsg = { role: 'user', content: input.trim(), _id: tempId };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    try {
      const { data } = await api.post(`/chat/${activeChat}/messages`, { content: userMsg.content });
      setMessages((prev) => [...prev, data.assistantMessage]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    } finally {
      setSending(false);
    }
  };

  const chats = chatsData?.chats || [];
  const QUICK_ACTIONS = [
    { label: 'Analyse budget', msg: 'Analyse mon budget du mois', color: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/15' },
    { label: 'Prioriser tâches', msg: 'Aide-moi à prioriser mes tâches', color: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/15' },
    { label: 'Conseils productivité', msg: 'Donne-moi des conseils pour être plus productif', color: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-500/15' },
    { label: 'Points fidélité', msg: 'Comment gagner des points de fidélité ?', color: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 dark:hover:bg-amber-500/15' },
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      {/* Sidebar - conversations */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
        className="w-64 flex-shrink-0 hidden lg:flex flex-col">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => createChat.mutate()}
          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2">
          <Plus size={16} /> Nouvelle conversation
        </motion.button>
        <div className="flex-1 mt-3 space-y-1 overflow-y-auto">
          {chats.length === 0 && !chatsLoading && (
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center py-6">Aucune conversation</p>
          )}
          {chats.map((chat) => (
            <button key={chat._id} onClick={() => setActiveChat(chat._id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeChat === chat._id
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}>
              <p className="font-medium truncate text-xs">{chat.title}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chat area */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 px-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-500/25">
                <Sparkles className="text-white" size={36} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">SmartLife AI</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Votre assistant intelligent personnel</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                {QUICK_ACTIONS.map((action) => (
                  <motion.button key={action.label} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { createChat.mutate(); setInput(action.msg); }}
                    className={`px-4 py-3 border rounded-xl text-sm font-medium text-left transition-all ${action.color}`}>
                    {action.label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div key={msg._id} initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2.5 max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      {msg.role !== 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                          <Bot size={14} className="text-white" />
                        </div>
                      )}
                      <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white rounded-2xl rounded-tr-md'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-2xl rounded-tl-md border border-gray-200 dark:border-gray-700/50'
                      }`}>
                        <div dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\n/g, '<br/>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/`(.*?)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 rounded text-xs">$1</code>'),
                        }} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {sending && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} className="text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-md border border-gray-200 dark:border-gray-700/50 px-4 py-3">
                      <div className="flex gap-1.5">
                        {[0, 150, 300].map((delay) => (
                          <span key={delay} className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-3">
                <input value={input} onChange={(e) => setInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all text-sm"
                  placeholder="Posez votre question..." />
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  type="submit" disabled={sending || !input.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all">
                  <Send size={16} />
                </motion.button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Chat;
