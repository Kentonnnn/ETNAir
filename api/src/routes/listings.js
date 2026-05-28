import { Router } from 'express';
import * as listingController from '../controllers/listingController.js';
import { authMiddleware } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import { body, param, validationResult } from 'express-validator';

const router = Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.get('/', listingController.getAllAnnonces);

router.get('/:id', listingController.getAnnonce);

router.post(
  '/',
  authMiddleware,
  upload.array('images', 5),
  [
    body('title').notEmpty().withMessage('Le titre est obligatoire').trim(),
    body('description').optional().isLength({ max: 1000 }),
    body('pricePerNight').notEmpty().isFloat({ gt: 0 }).withMessage('Le prix doit être supérieur à 0'),
    body('city').notEmpty().withMessage('La ville est obligatoire'),
  ],
  validate,
  listingController.createAnnonce
);

router.put(
  '/:id',
  authMiddleware,
  upload.array('images', 5),
  [
    param('id').isInt().withMessage("L'identifiant doit être un entier"),
    body('title').optional().trim(),
    body('description').optional().isLength({ max: 1000 }),
    body('pricePerNight').optional().isFloat({ gt: 0 }),
    body('city').optional().isString(),
  ],
  validate,
  listingController.updateAnnonce
);

router.delete(
  '/:id',
  authMiddleware,
  [param('id').isInt().withMessage("L'identifiant doit être un entier")],
  validate,
  listingController.deleteAnnonce
);

export default router;