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
router.put('/:id', userController.updateUtilisateur);

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
router.delete('/:id', userController.deleteUtilisateur);