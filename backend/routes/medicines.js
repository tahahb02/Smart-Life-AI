import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../controllers/medicineController.js';

const router = Router();

router.get('/', protect, verifiedOnly, getMedicines);
router.post('/', protect, verifiedOnly, createMedicine);
router.put('/:id', protect, verifiedOnly, updateMedicine);
router.delete('/:id', protect, verifiedOnly, deleteMedicine);

export default router;
