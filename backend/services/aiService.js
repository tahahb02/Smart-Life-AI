import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Mistral } from '@mistralai/mistralai';
import { SYSTEM_PROMPT, buildWelcomeMessage, getFallbackResponse } from './systemPrompt.js';

const isPlaceholder = (key) => !key || key === 'your_openai_api_key' || key === 'your_gemini_api_key' || key === 'your_mistral_api_key';

class AIProvider {
  constructor(provider = 'openai') {
    this.provider = provider;
    this.clients = {};
    this._initClient(provider);
  }

  _initClient(provider) {
    switch (provider) {
      case 'openai':
        if (!isPlaceholder(process.env.OPENAI_API_KEY)) {
          this.clients.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        break;
      case 'gemini':
        if (!isPlaceholder(process.env.GEMINI_API_KEY)) {
          this.clients.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        }
        break;
      case 'mistral':
        if (!isPlaceholder(process.env.MISTRAL_API_KEY)) {
          this.clients.mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });
        }
        break;
    }
  }

  _hasValidKey() {
    switch (this.provider) {
      case 'openai': return !!this.clients.openai;
      case 'gemini': return !!this.clients.gemini;
      case 'mistral': return !!this.clients.mistral;
      default: return false;
    }
  }

  _buildMessages(userMessages) {
    const systemMsg = { role: 'system', content: SYSTEM_PROMPT };
    const filtered = userMessages.filter((m) => m.role !== 'system');
    return [systemMsg, ...filtered];
  }

  async generateResponse(messages, options = {}) {
    if (!this._hasValidKey()) {
      const userContent = messages[messages.length - 1]?.content || '';
      const response = getFallbackResponse(userContent);
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 1000));
      return response;
    }

    const model = options.model || 'gpt-3.5-turbo';
    const preparedMessages = this._buildMessages(messages);

    switch (this.provider) {
      case 'openai':
        return this._openAIResponse(preparedMessages, model);
      case 'gemini':
        return this._geminiResponse(preparedMessages);
      case 'mistral':
        return this._mistralResponse(preparedMessages, model);
      default:
        throw new Error(`Fournisseur IA ${this.provider} non supporté`);
    }
  }

  async _openAIResponse(messages, model) {
    const completion = await this.clients.openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  }

  async _geminiResponse(messages) {
    const model = this.clients.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const chat = model.startChat({ history: messages.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))});
    const lastMsg = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMsg);
    return result.response.text();
  }

  async _mistralResponse(messages, model) {
    const response = await this.clients.mistral.chat({
      model: model || 'mistral-tiny',
      messages,
    });
    return response.choices[0].message.content;
  }

  static getWelcomeMessage(userName) {
    return buildWelcomeMessage(userName);
  }

  async generateSummary(text, options = {}) {
    const prompt = `Résume le texte suivant en français, extrais les points importants, crée une checklist et des flashcards:\n\n${text}`;
    return this.generateResponse([{ role: 'user', content: prompt }], options);
  }

  async generateRecommendations(habits, options = {}) {
    const prompt = `Analyse ces habitudes quotidiennes et propose des recommandations pour améliorer: économies, sport, nutrition, gestion du temps, organisation, bien-être, productivité.\n\nHabitudes: ${JSON.stringify(habits)}`;
    return this.generateResponse([{ role: 'user', content: prompt }], options);
  }

  async analyzeBudget(transactions, options = {}) {
    const prompt = `Analyse ces transactions financières et détecte: dépenses inutiles, abonnements oubliés, économies possibles, tendances.\n\nTransactions: ${JSON.stringify(transactions)}`;
    return this.generateResponse([{ role: 'user', content: prompt }], options);
  }

  async generateQuiz(text, options = {}) {
    const prompt = `Génère un quiz de 5 questions à choix multiples basé sur ce texte:\n\n${text}`;
    return this.generateResponse([{ role: 'user', content: prompt }], options);
  }
}

export default AIProvider;
