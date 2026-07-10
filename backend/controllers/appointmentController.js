import Appointment from '../models/Appointment.js';

export const getAppointments = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 50 } = req.query;
    const query = { userId: req.user._id };
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const appointments = await Appointment.find(query).sort({ date: 1 }).limit(limit * 1).skip((page - 1) * limit);
    const total = await Appointment.countDocuments(query);

    res.json({ appointments, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    res.json({ appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!appointment) return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    res.json({ message: 'Rendez-vous supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
