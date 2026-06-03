import { Router } from 'express'
import { body, param, validationResult } from 'express-validator'
import { authMiddleware } from '../middleware/auth.js'
import * as booking from '../controllers/bookingController.js'

const router = Router()
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  next()
}

router.get('/mes-reservations', authMiddleware, booking.getMyBookings)
router.get('/recues', authMiddleware, booking.getReceivedBookings)
router.get('/disponibilite/:listingId', [param('listingId').isInt()], validate, booking.getAvailability)

router.post('/', authMiddleware, [
  body('listingId').isInt().withMessage('listingId requis'),
  body('startDate').isISO8601().withMessage('startDate invalide'),
  body('endDate').isISO8601().withMessage('endDate invalide'),
], validate, booking.createBooking)

router.put('/:id/confirmer', authMiddleware, [param('id').isInt()], validate, booking.confirmBooking)
router.put('/:id/annuler',   authMiddleware, [param('id').isInt()], validate, booking.cancelBooking)

export default router
