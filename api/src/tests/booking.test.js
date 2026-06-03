import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import app from '../../server.js'

const TENANT  = { id: 1, role: 'tenant', firstName: 'T', lastName: 'U', email: 't@test.com' }
const OWNER   = { id: 2, role: 'owner',  firstName: 'O', lastName: 'W', email: 'o@owner.com' }
const LISTING = { id: 10, ownerId: OWNER.id, pricePerNight: 100, title: 'X', city: 'Paris' }

const tenantToken = jwt.sign({ userId: TENANT.id }, process.env.JWT_SECRET || 'supersecretkey')

beforeEach(() => {
  // Reset entre chaque test pour éviter les effets de bord
  jest.clearAllMocks()
})

afterAll(async () => {
  await prisma?.$disconnect()
})

describe('GET /annonces — flag isBooked', () => {
  it('isBooked: true quand une réservation confirmée active existe', async () => {
    prisma.listing.findMany.mockResolvedValue([
      { ...LISTING, images: [], owner: OWNER, _count: { bookings: 1 } }
    ])

    const res = await request(app).get('/annonces')

    expect(res.statusCode).toBe(200)
    expect(res.body.listings[0].isBooked).toBe(true)
  })

  it("isBooked: false sans réservation", async () => {
    prisma.listing.findMany.mockResolvedValue([
      { ...LISTING, images: [], owner: OWNER, _count: { bookings: 0 } }
    ])

    const res = await request(app).get('/annonces')

    expect(res.statusCode).toBe(200)
    expect(res.body.listings[0].isBooked).toBe(false)
  })

  it("isBooked: false si réservation expirée ou annulée (le where les filtre)", async () => {
    // Le where de Prisma filtre déjà status=confirmed + endDate>=now,
    // donc _count.bookings = 0 même si des bookings annulés/expirés existent en base
    prisma.listing.findMany.mockResolvedValue([
      { ...LISTING, images: [], owner: OWNER, _count: { bookings: 0 } }
    ])

    const res = await request(app).get('/annonces')

    expect(res.statusCode).toBe(200)
    expect(res.body.listings[0].isBooked).toBe(false)
  })
})

describe('POST /reservations — createBooking', () => {
  it("refuse une création avec une date passée", async () => {
    prisma.user.findUnique.mockResolvedValue(TENANT)
    prisma.listing.findUnique.mockResolvedValue(LISTING)

    const res = await request(app)
      .post('/reservations')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({
        listingId: LISTING.id,
        startDate: new Date(Date.now() - 86400000),
        endDate:   new Date(Date.now() + 86400000),
      })

    expect(res.statusCode).toBe(400)
  })
})

describe('PUT /reservations/:id/annuler — cancelBooking', () => {
  it("le locataire peut annuler sa réservation", async () => {
    prisma.user.findUnique.mockResolvedValue(TENANT)
    prisma.booking.findUnique.mockResolvedValue({
      id: 1, userId: TENANT.id, status: 'pending',
      cancelDeadline: new Date(Date.now() + 86400000),
      listing: { ownerId: OWNER.id },
    })
    prisma.booking.update.mockResolvedValue({ id: 1, status: 'cancelled' })

    const res = await request(app)
      .put('/reservations/1/annuler')                      // PUT, pas POST
      .set('Authorization', `Bearer ${tenantToken}`)

    expect(res.statusCode).toBe(200)
    expect(res.body.booking.status).toBe('cancelled')
  })
})

describe('GET /reservations/disponibilite/:listingId', () => {
  it("filtre sur status pending/confirmed et endDate future", async () => {
    prisma.user.findUnique.mockResolvedValue(TENANT)
    prisma.booking.findMany.mockResolvedValue([])

    await request(app)
      .get('/reservations/disponibilite/10')
      .set('Authorization', `Bearer ${tenantToken}`)

    const callArgs = prisma.booking.findMany.mock.calls[0][0]
    expect(callArgs.where.status).toEqual({ in: ['pending', 'confirmed'] })
    expect(callArgs.where.endDate.gte).toBeInstanceOf(Date)
  })
})
