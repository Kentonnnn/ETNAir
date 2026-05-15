import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { body, param, validationResult } from 'express-validator'

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
 * /utilisateurs:
 *   get:
 *     summary: Get all users
 *     tags: [Utilisateurs]
 *     responses:
 *       200:
 *         description: List of all users
 */
router.get('/', userController.getAllUtilisateurs);

/**
 * @swagger
 * /utilisateurs/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User details
 *       404:
 *         description: User not found
 */
router.get('/:id', userController.getUtilisateur);

export default router;

/**
 * @swagger
 * /utilisateurs/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 example: user@mail.com
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put(
    '/:id',
    [
      param('id')
        .isInt()
        .withMessage("L'identifiant doit être un entier"),
      
      body('firstName')
        .notEmpty()
        .withMessage('Le prénom ne doit pas être vide')
        .isLength({ min: 1 })
        .withMessage('Le prénom doit contenir au moins 1 caractère')
        .trim(),
      
      body('lastName')
        .notEmpty()
        .withMessage('Le nom ne doit pas être vide')
        .isLength({ min: 1 })
        .withMessage('Le nom doit contenir au moins 1 caractère')
        .trim(),
    
      body('email')
        .notEmpty()
        .withMessage("L'email ne doit pas être vide")
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    ],
    validate,
    userController.updateUtilisateur
);

/**
 * @swagger
 * /utilisateurs/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
    '/:id',
    [
      param('id')
        .isInt()
        .withMessage("L'identifiant doit être un entier")
    ],
    validate,
    userController.deleteUtilisateur
);