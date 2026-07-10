import { body } from 'express-validator';

export const verifyOTPValidation = [
  body('code')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Le code OTP doit contenir 6 chiffres'),
];

export const resendOTPValidation = [
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().isMobilePhone().withMessage('Téléphone invalide'),
];
