import Medicine from '../models/Medicine.js';

export const getMedicines = async (req, res) => {
  try {
    const { active, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (active !== undefined) query.active = active === 'true';

    const medicines = await Medicine.find(query).sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Medicine.countDocuments(query);

    res.json({ medicines, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!medicine) return res.status(404).json({ message: 'Médicament non trouvé' });
    res.json({ medicine });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!medicine) return res.status(404).json({ message: 'Médicament non trouvé' });
    res.json({ message: 'Médicament supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
