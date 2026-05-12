import { Router } from 'express';
import * as listingController from '../controllers/listingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

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
router.post('/', authMiddleware, listingController.createAnnonce);

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
router.put('/:id', authMiddleware, listingController.updateAnnonce);

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
router.delete('/:id', authMiddleware, listingController.deleteAnnonce);

export default router;