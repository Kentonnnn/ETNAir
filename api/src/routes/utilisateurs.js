import { Router } from 'express';
import * as userController from '../controllers/userController.js';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/', userController.getAllUtilisateurs);

router.get('/:id', authMiddleware, userController.getUtilisateur);

export default router;

router.put(
  '/:id',
  authMiddleware,
  [
    param('id').isInt().withMessage("L'identifiant doit être un entier"),
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  validate,
  userController.updateUtilisateur
);

router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage("L'identifiant doit être un entier")],
  validate,
  userController.deleteUtilisateur
);