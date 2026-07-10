import { Router } from 'express';
import { protect, verifiedOnly } from '../middlewares/auth.js';
import multer from 'multer';
import { getInvoices, uploadInvoice, processOCR, deleteInvoice } from '../controllers/invoiceController.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.get('/', protect, verifiedOnly, getInvoices);
router.post('/upload', protect, verifiedOnly, upload.single('file'), uploadInvoice);
router.post('/:id/ocr', protect, verifiedOnly, processOCR);
router.delete('/:id', protect, verifiedOnly, deleteInvoice);

export default router;
