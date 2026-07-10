import { Router } from 'express';
import { protect } from '../middlewares/auth.js';
import {
  register, login, logout, refreshToken, forgotPassword,
  resetPassword, getMe, verifyOTP, resendOTP,
} from '../controllers/authController.js';
import {
  registerValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation,
} from '../validators/auth.js';
import { verifyOTPValidation, resendOTPValidation } from '../validators/otp.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);
router.get('/me', protect, getMe);
router.post('/verify-otp', protect, verifyOTPValidation, verifyOTP);
router.post('/resend-otp', protect, resendOTPValidation, resendOTP);

export default router;
