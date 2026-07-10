import { validationResult } from 'express-validator';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Settings from '../models/Settings.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { sendOTPEmail } from '../utils/sendEmail.js';
import { sendWhatsAppOTP } from '../utils/sendWhatsApp.js';
import crypto from 'crypto';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (method, email, phone, otpCode) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=================================');
    console.log(`📱 CODE OTP (${method.toUpperCase()}): ${otpCode}`);
    console.log(`📧 Destinataire: ${method === 'whatsapp' ? phone : email}`);
    console.log('=================================');
  }

  if (method === 'whatsapp' && phone) {
    await sendWhatsAppOTP(phone, otpCode);
  } else {
    await sendOTPEmail(email, otpCode);
  }
};

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone, verifyMethod } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    const user = await User.create({ name, email, password, phone, verifyMethod: verifyMethod || 'email' });

    await Settings.create({ userId: user._id });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({
      userId: user._id,
      code: otpCode,
      type: verifyMethod === 'whatsapp' ? 'whatsapp' : 'email',
      expiresAt,
    });

    try {
      await sendOTP(verifyMethod || 'email', email, phone, otpCode);
    } catch (emailErr) {
      console.error('Envoi OTP échoué (non bloquant):', emailErr.message);
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
      message: 'Inscription réussie. Vérifiez votre code OTP.',
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Erreur register:', error);
    const message = error.code === 11000
      ? 'Cet email est déjà utilisé'
      : error.name === 'ValidationError'
        ? Object.values(error.errors).map(e => e.message).join(', ')
        : "Erreur lors de l'inscription";
    res.status(500).json({ message });
  }
};

export const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, rememberMe } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Ce compte a été désactivé' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    user.lastLogin = new Date();
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      message: 'Connexion réussie',
      user: user.toJSON(),
      accessToken,
      refreshToken,
      rememberMe: !!rememberMe,
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

export const logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ message: 'Déconnexion réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la déconnexion' });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Refresh token requis' });
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: 'Refresh token invalide' });
    }

    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ message: 'Refresh token invalide ou expiré' });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Aucun compte trouvé avec cet email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendOTPEmail(email, `Cliquez ici pour réinitialiser: ${resetUrl}`);

    res.json({ message: 'Email de réinitialisation envoyé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password, token } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la réinitialisation' });
  }
};

export const getMe = async (req, res) => {
  res.json({ user: req.user });
};

export const verifyOTP = async (req, res) => {
  try {
    const { code } = req.body;
    const userId = req.user._id;

    const otp = await OTP.findOne({
      userId,
      code,
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otp) {
      return res.status(400).json({ message: 'Code invalide ou expiré' });
    }

    if (otp.attempts >= otp.maxAttempts) {
      await OTP.deleteMany({ userId, verified: false });
      const newOtpCode = generateOTP();
      const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await OTP.create({ userId, code: newOtpCode, type: otp.type, expiresAt: newExpiresAt });
      const userDoc = await User.findById(userId);
      try {
        await sendOTP(otp.type, userDoc?.email, userDoc?.phone, newOtpCode);
      } catch (sendErr) {
        console.error('Envoi OTP échoué:', sendErr.message);
      }
      return res.status(429).json({ message: 'Trop de tentatives. Un nouveau code a été envoyé.' });
    }

    otp.attempts += 1;
    otp.verified = true;
    await otp.save();

    await User.findByIdAndUpdate(userId, { isVerified: true });

    res.json({ message: 'Compte vérifié avec succès' });
  } catch (error) {
    console.error('Erreur verifyOTP:', error);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const method = user?.verifyMethod || 'email';
    const email = user?.email;
    const phone = user?.phone;

    await OTP.deleteMany({ userId, verified: false });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({ userId, code: otpCode, type: method, expiresAt });

    try {
      await sendOTP(method, email, phone, otpCode);
    } catch (sendErr) {
      console.error('Envoi OTP échoué (non bloquant):', sendErr.message);
    }

    res.json({ message: 'Nouveau code envoyé', expiresAt });
  } catch (error) {
    console.error('Erreur resendOTP:', error);
    res.status(500).json({ message: 'Erreur lors du renvoi du code' });
  }
};
