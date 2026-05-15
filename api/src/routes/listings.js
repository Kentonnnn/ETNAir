import { Router } from 'express';
import * as listingController from '../controllers/listingController.js';
import { authMiddleware } from '../middleware/auth.js';
import { body, param, validationResult } from 'express-validator';

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
};

/**
 * @swagger
 * /annonces:
 *   get:
 *     summary: Get all annonces
 *     tags: [Annonces]
 *     responses:
 *       200:
 *         description: List of all annonces
 */
router.get('/', listingController.getAllAnnonces);

/**
 * @swagger
 * /annonces/{id}:
 *   get:
 *     summary: Get annonce by ID
 *     tags: [Annonces]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce details
 *       404:
 *         description: Annonce not found
 */
router.get('/:id', listingController.getAnnonce);

/**
 * @swagger
 * /annonces:
 *   post:
 *     summary: Create a new annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - prix
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               localisation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Annonce created successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authMiddleware,
  [
    body('titre')
      .notEmpty()
      .withMessage('Le titre est obligatoire')
      .isLength({ min: 6 })
      .withMessage('Le titre doit contenir au moins 6 caractères')
      .trim(),
    
    body('description')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('La description ne doit pas dépasser 1000 caractères'),
    
    body('prix')
      .notEmpty()
      .withMessage('Le prix est obligatoire')
      .isFloat({ gt: 0 })
      .withMessage('Le prix doit être supérieur à 0'),
    
    body('localisation')
      .notEmpty()
      .withMessage('Veuillez indiquer la localisation de l\'habitation')
      .isString()
      .withMessage('La localisation doit être une chaîne de caractères'),
  ],
  validate,
  listingController.createAnnonce
);

/**
 * @swagger
 * /annonces/{id}:
 *   put:
 *     summary: Update annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
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
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               localisation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Annonce updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Annonce not found
 */
router.put(
    '/:id', 
    authMiddleware,
    [
      param('id')
        .isInt()
        .withMessage("L'identifiant doit être un entier"),
    
      body('titre')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Le titre doit contenir au moins 6 caractères'),

      body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage(
          'La description ne doit pas dépasser 1000 caractères'
        ),

      body('prix')
        .optional()
        .isFloat({ gt: 0 })
        .withMessage('Le prix doit être supérieur à 0'),

      body('localisation')
        .optional()
        .isString()
        .withMessage('La localisation doit être une chaîne de caractères'),
    ],
    validate,
    listingController.updateAnnonce
);

/**
 * @swagger
 * /annonces/{id}:
 *   delete:
 *     summary: Delete annonce
 *     tags: [Annonces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Annonce deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Annonce not found
 */
router.delete(
    '/:id',
    authMiddleware,
    [
      param('id')
        .inInt()
        .withMessage("L'identifiant doit être un entier"),
    ],
    validate,
    listingController.deleteAnnonce
);

export default router;