export const SYSTEM_PROMPT = `Tu es SmartLife AI, un assistant IA expert en gestion de vie quotidienne.

Tu as accès aux données de l'utilisateur (budget, tâches, rendez-vous, médicaments) pour donner des conseils personnalisés.

DOMAINES D'EXPERTISE :
💰 Budget - Analyse, économies, détection d'abus
✅ Tâches - Priorisation, organisation, deadlines
📅 Rendez-vous - Planification, rappels
💊 Santé - Suivi médicaments, rappels de prise
📊 Résumés - Documents, quiz, fiches de révision

RÈGLES :
- Réponds en français
- Sois concis et utile
- Utilise le markdown
- Propose des actions concrètes
- Ne donne jamais de conseils médicaux sans consulter un professionnel`;

export const buildWelcomeMessage = (userName) => `Bonjour ${userName} ! 👋

Je suis **SmartLife AI**, votre assistant personnel intelligent.

Je peux vous aider avec :

💰 **Budget** — Analyse de vos revenus/dépenses, conseils d'économies
✅ **Tâches** — Organisation et priorisation de vos journées
📅 **Rendez-vous** — Gestion de votre agenda
💊 **Santé** — Suivi de vos traitements et médicaments
📊 **Résumés** — Analyse de documents, quiz, fiches

Posez-moi n'importe quelle question !`;

const KEYWORD_RESPONSES = [
  { keywords: ['budget', 'argent', 'depense', 'revenu', 'solde', 'finance', 'economie'], response: "Basé sur vos données financières, je peux vous aider à analyser votre budget. Consultez l'onglet **Budget** pour voir vos revenus et dépenses du mois.\n\nVoulez-vous que je vous donne des conseils pour optimiser vos finances ?" },
  { keywords: ['tache', 'tâche', 'travail', 'todo', 'faire', 'deadline'], response: "Je peux vous aider à organiser vos tâches ! Allez dans l'onglet **Tâches** pour :\n- Ajouter de nouvelles tâches\n- Prioriser celles qui sont urgentes\n- Suivre votre progression\n\nVoulez-vous que je vous aide à prioriser ?" },
  { keywords: ['rendez', 'rdv', 'appointment', 'calendrier', 'agenda'], response: "Pour gérer vos rendez-vous, rendez-vous dans l'onglet **Rendez-vous**. Vous pouvez :\n- Créer un nouveau rendez-vous avec date, lieu et priorité\n- Suivre les statuts (planifié, terminé, annulé)\n- Recevoir des rappels\n\nAvez-vous un rendez-vous à planifier ?" },
  { keywords: ['medicament', 'med', 'santé', 'sante', 'traitement', 'pilule', 'ordo'], response: "Pour le suivi de vos médicaments, consultez l'onglet **Médicaments**. Vous pouvez :\n- Ajouter vos traitements en cours\n- Définir les horaires de prise\n- Suivre votre observance\n\n⚠️ Pour toute question médicale, consultez toujours un professionnel de santé." },
  { keywords: ['points', 'fidélite', 'fidelite', 'cadeau', 'recompense', 'parrain'], response: "Le système de fidélité SmartLife vous récompense pour votre engagement :\n\n🏆 **Gagner des points :**\n• Visite médecin généraliste : 600 pts\n• Visite spécialiste : 1000 pts\n• Tâche complétée : 25 pts\n• Parrainage : 500 pts\n\nConsultez votre profil pour voir vos points et échanger vos récompenses !" },
  { keywords: ['aide', 'help', 'comment', 'how', 'utiliser'], response: "SmartLife AI est votre assistant complet. Voici comment l'utiliser :\n\n1. **Dashboard** — Vue d'ensemble de votre vie\n2. **Budget** — Gérez votre argent\n3. **Tâches** — Organisez votre temps\n4. **Rendez-vous** — Planifiez vos événements\n5. **Médicaments** — Suivez votre santé\n6. **Profil** — Gérez vos préférences et points\n\nQue souhaitez-vous savoir en détail ?" },
];

export const getFallbackResponse = (userContent, userName = 'Utilisateur') => {
  const lower = userContent.toLowerCase();
  for (const item of KEYWORD_RESPONSES) {
    if (item.keywords.some((k) => lower.includes(k))) {
      return item.response;
    }
  }
  const defaults = [
    `Merci pour votre question ! En tant qu'assistant SmartLife, je peux vous aider avec votre budget, vos tâches, vos rendez-vous et votre santé. Essayez de poser une question sur l'un de ces domaines.`,
    `Je suis là pour vous aider, ${userName} ! Posez-moi une question sur votre budget, vos tâches, vos rendez-vous ou vos médicaments.`,
    `Intéressant ! Pour mieux vous aider, pouvez-vous préciser votre demande ? Je peux vous assister sur :\n• 💰 Budget\n• ✅ Tâches\n• 📅 Rendez-vous\n• 💊 Médicaments`,
  ];
  return defaults[Math.floor((userContent.length + Date.now()) % defaults.length)];
};
