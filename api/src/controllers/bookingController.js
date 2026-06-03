import { prisma } from '../lib/prisma.js'

const bookingInclude = {
  listing: {
    select: {
      id: true, title: true, city: true, pricePerNight: true,
      images: { take: 1 },
      owner: { select: { id: true, firstName: true, lastName: true } }
    }
  },
  user: { select: { id: true, firstName: true, lastName: true, email: true } }
}

// POST /reservations
export const createBooking = async (req, res) => {
  try {
    const userId = req.userId
    const { listingId, startDate, endDate } = req.body

    if (!listingId || !startDate || !endDate)
      return res.status(400).json({ error: 'listingId, startDate et endDate sont requis' })

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date(); today.setHours(0, 0, 0, 0)

    if (start < today)
      return res.status(400).json({ error: 'La date d\'arrivée doit être dans le futur' })

    const nights = Math.ceil((end - start) / 86400000)
    if (nights < 1)
      return res.status(400).json({ error: 'La durée minimale est d\'une nuit' })

    const listing = await prisma.listing.findUnique({ where: { id: parseInt(listingId) } })
    if (!listing) return res.status(404).json({ error: 'Annonce introuvable' })
    if (listing.ownerId === userId)
      return res.status(403).json({ error: 'Vous ne pouvez pas réserver votre propre annonce' })

    // Check date conflicts
    const conflict = await prisma.booking.findFirst({
      where: {
        listingId: parseInt(listingId),
        status: { in: ['pending', 'confirmed'] },
        AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }]
      }
    })
    if (conflict)
      return res.status(409).json({ error: 'Ces dates ne sont pas disponibles' })

    const totalPrice = parseFloat(listing.pricePerNight) * nights
    // Cancel deadline: 48h before start date
    const cancelDeadline = new Date(start)
    cancelDeadline.setHours(cancelDeadline.getHours() - 48)

    const booking = await prisma.booking.create({
      data: {
        userId,
        listingId: parseInt(listingId),
        startDate: start,
        endDate: end,
        totalPrice,
        status: 'pending',
        cancelDeadline
      },
      include: bookingInclude
    })

    res.status(201).json({ booking })
  } catch (error) {
    console.error('createBooking error:', error)
    res.status(500).json({ error: error.message })
  }
}

// GET /reservations/mes-reservations
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' }
    })
    res.json({ bookings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /reservations/recues  (owner sees bookings on their listings)
export const getReceivedBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { listing: { ownerId: req.userId } },
      include: bookingInclude,
      orderBy: { createdAt: 'desc' }
    })
    res.json({ bookings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /reservations/:id/confirmer  (owner only)
export const confirmBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { listing: true }
    })
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' })
    if (booking.listing.ownerId !== req.userId) return res.status(403).json({ error: 'Accès refusé' })
    if (booking.status !== 'pending') return res.status(400).json({ error: 'Seule une réservation en attente peut être confirmée' })

    const updated = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'confirmed' },
      include: bookingInclude
    })
    res.json({ booking: updated })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// PUT /reservations/:id/annuler  (tenant or owner)
export const cancelBooking = async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { listing: true }
    })
    if (!booking) return res.status(404).json({ error: 'Réservation introuvable' })

    const isTenant = booking.userId === req.userId
    const isOwner  = booking.listing.ownerId === req.userId
    if (!isTenant && !isOwner) return res.status(403).json({ error: 'Accès refusé' })
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'Réservation déjà annulée' })

    if (booking.cancelDeadline && new Date() > booking.cancelDeadline)
      return res.status(400).json({ error: 'Le délai d\'annulation est dépassé (48h avant l\'arrivée)' })

    const updated = await prisma.booking.update({
      where: { id: parseInt(req.params.id) },
      data: { status: 'cancelled' },
      include: bookingInclude
    })
    res.json({ booking: updated, message: 'Réservation annulée' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// GET /reservations/disponibilite/:listingId
export const getAvailability = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        listingId: parseInt(req.params.listingId),
        status: { in: ['pending', 'confirmed'] },
        endDate: { gte: new Date() }
      },
      select: { startDate: true, endDate: true, status: true }
    })
    res.json({ bookedDates: bookings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
