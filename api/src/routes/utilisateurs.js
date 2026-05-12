import { Router } from 'express';
import * as userController from '../controllers/userController.js';

const router = Router();

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