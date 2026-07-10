import { body } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractère spécial'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
  body('password').notEmpty().withMessage('Le mot de passe est requis'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
];

export const resetPasswordValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Le mot de passe doit contenir une minuscule, une majuscule, un chiffre et un caractère spécial'),
  body('token').notEmpty().withMessage('Token requis'),
];
