import { Router } from 'express';
import multer from 'multer';
import { protect, authorize, verifiedOnly } from '../middlewares/auth.js';
import {
  getUsers, getUser, updateUser, deleteUser, updateProfile, changePassword, getDashboardStats,
} from '../controllers/userController.js';
import User from '../models/User.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont acceptées'), false);
  },
});

const router = Router();

router.post('/profile/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé' });
    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    const user = await User.findByIdAndUpdate(req.user._id, { avatar: base64 }, { new: true });
    res.json({ user: user.toJSON(), avatar: base64 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dashboard/stats', protect, verifiedOnly, getDashboardStats);
router.get('/profile', protect, (req, res) => res.json({ user: req.user }));
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.get('/users', protect, authorize('admin'), verifiedOnly, getUsers);
router.get('/users/:id', protect, authorize('admin'), verifiedOnly, getUser);
router.put('/users/:id', protect, authorize('admin'), verifiedOnly, updateUser);
router.delete('/users/:id', protect, authorize('admin'), verifiedOnly, deleteUser);

export default router;
