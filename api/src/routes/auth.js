import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { body, validationResult } from 'express-validator';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
        success: false,
        errors: errors.array(),
    });
  }

  next();
}

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [tenant, owner, admin]
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already in use
 */
router.post(
    '/register',
    [
      body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Le mot de passe doit contenir au moins 6 caractères'),
  

      body('firstName')
        .notEmpty()
        .withMessage('Le prénom est obligatoire')
        .trim(),
    
      body('lastName')
        .notEmpty()
        .withMessage('Le nom est obligatoire')
        .trim(),
    
      body('role')
        .optional()
        .isIn(['tenant', 'owner', 'admin'])
        .withMessage('Rôle invalide'),
    ],
    validate,
    authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
    '/login',
    [
      body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    
      body('password')
        .notEmpty()
        .withMessage('Le mot de passe est obligatoire'),
    ],
    validate,
    authController.login
);

export default router;