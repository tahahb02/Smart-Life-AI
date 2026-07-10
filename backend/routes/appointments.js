import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import {
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
} from '../controllers/appointmentController.js';

const router = Router();

router.get('/', protect, verifiedOnly, getAppointments);
router.post('/', protect, verifiedOnly, createAppointment);
router.put('/:id', protect, verifiedOnly, updateAppointment);
router.delete('/:id', protect, verifiedOnly, deleteAppointment);

export default router;
