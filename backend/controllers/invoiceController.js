import Invoice from '../models/Invoice.js';
import Transaction from '../models/Transaction.js';
import cloudinary from '../config/cloudinary.js';

export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ invoices });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadInvoice = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Fichier requis' });

    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'invoices' });

    const invoice = await Invoice.create({
      userId: req.user._id,
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      status: 'pending',
    });

    res.status(201).json({ invoice });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const processOCR = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });

    const aiService = new (await import('../services/aiService.js')).default(req.user.aiPreferences?.provider);
    const result = await aiService.generateResponse([
      { role: 'system', content: 'Extrais les informations de cette facture: montant, TVA, date, entreprise, catégorie. Réponds en JSON.' },
      { role: 'user', content: `Analyse cette facture: ${invoice.imageUrl}` },
    ]);

    const parsed = JSON.parse(result);
    Object.assign(invoice, parsed, { status: 'processed' });
    await invoice.save();

    await Transaction.create({
      userId: req.user._id,
      type: 'expense',
      amount: parsed.amount || 0,
      category: parsed.category || 'Autre',
      description: `Facture - ${parsed.company || ''}`,
      date: parsed.date || new Date(),
      invoice: invoice._id,
    });

    res.json({ invoice, ocrData: parsed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });
    if (invoice.cloudinaryId) await cloudinary.uploader.destroy(invoice.cloudinaryId);
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
