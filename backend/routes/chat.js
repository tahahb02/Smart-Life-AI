import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import AIProvider from '../services/aiService.js';

const router = Router();

router.get('/', protect, verifiedOnly, async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.user._id, isActive: true })
      .sort({ updatedAt: -1 })
      .select('title provider updatedAt');
    res.json({ chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, verifiedOnly, async (req, res) => {
  try {
    const chat = await Chat.create({ userId: req.user._id, title: req.body.title || 'Nouvelle conversation', provider: req.user.aiPreferences?.provider || 'openai' });
    
    const welcomeContent = AIProvider.getWelcomeMessage(req.user.name || 'Utilisateur');
    const welcomeMessage = await Message.create({ chatId: chat._id, role: 'assistant', content: welcomeContent });
    chat.messages.push(welcomeMessage._id);
    await chat.save();

    res.status(201).json({ chat, welcomeMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/messages', protect, verifiedOnly, async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.id }).sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/messages', protect, verifiedOnly, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le message ne peut pas être vide' });
    }

    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: 'Chat non trouvé' });

    const userMessage = await Message.create({ chatId: chat._id, role: 'user', content: content.trim() });
    chat.messages.push(userMessage._id);

    const previousMessages = await Message.find({ chatId: chat._id }).sort({ createdAt: -1 }).limit(20);
    const history = previousMessages.reverse().map((m) => ({ role: m.role, content: m.content }));

    const ai = new AIProvider(chat.provider);
    const aiResponse = await ai.generateResponse([...history, { role: 'user', content: content.trim() }]);

    if (!aiResponse) {
      return res.status(500).json({ message: "L'assistant n'a pas pu générer de réponse" });
    }

    const assistantMessage = await Message.create({ chatId: chat._id, role: 'assistant', content: aiResponse });
    chat.messages.push(assistantMessage._id);
    chat.updatedAt = new Date();
    if (chat.title === 'Nouvelle conversation' && content.trim().length < 50) {
      chat.title = content.trim().slice(0, 40) + '...';
    }
    await chat.save();

    res.json({ userMessage, assistantMessage });
  } catch (error) {
    console.error('Erreur chat message:', error);
    const message = error.status === 429
      ? 'Trop de requêtes à l\'API IA. Veuillez réessayer dans un instant.'
      : error.status === 401
        ? 'Clé API IA invalide. Vérifiez votre configuration.'
        : error.message?.includes('ECONNREFUSED')
          ? 'Impossible de contacter le service IA. Vérifiez votre connexion.'
          : `Erreur lors de la génération de la réponse: ${error.message}`;
    res.status(500).json({ message });
  }
});

router.delete('/:id', protect, verifiedOnly, async (req, res) => {
  try {
    await Chat.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    res.json({ message: 'Chat supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
