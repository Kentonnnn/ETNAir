import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import app from '../../server.js'

const MOCK_USER = {
  id: 1,
  email: 'owner@example.com',
  firstName: 'Owner',
  lastName: 'User',
  role: 'owner',
}

const MOCK_LISTING = {
  id: 1,
  title: 'Bel appartement à Paris',
  description: 'Spacieux et moderne',
  city: 'Paris',
  pricePerNight: 100,
  ownerId: MOCK_USER.id,
  availableFrom: new Date().toISOString(),
  availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  owner: MOCK_USER,
  images: [],
  reviews: [],
}

const token = jwt.sign(
  { userId: MOCK_USER.id },
  process.env.JWT_SECRET || 'supersecretkey',
  { expiresIn: '1h' }
)

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Routes annonces', () => {
  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue(MOCK_USER)
    prisma.listing.findMany.mockResolvedValue([MOCK_LISTING])
    prisma.listing.findUnique.mockResolvedValue(MOCK_LISTING)
    prisma.listing.create.mockResolvedValue(MOCK_LISTING)
    prisma.listing.update.mockResolvedValue({ ...MOCK_LISTING, title: 'Annonce mise à jour', pricePerNight: 120 })
    prisma.listing.delete.mockResolvedValue(MOCK_LISTING)
  })

  describe('GET /annonces', () => {
    it('devrait retourner toutes les annonces', async () => {
      const res = await request(app).get('/annonces')
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body.listings)).toBe(true)
    })

    it('devrait supporter la pagination', async () => {
      const res = await request(app).get('/annonces?page=1&limit=10')
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('page')
      expect(res.body).toHaveProperty('limit')
    })
  })

  describe('GET /annonces/:id', () => {
    it('devrait retourner une annonce par ID', async () => {
      const res = await request(app).get(`/annonces/${MOCK_LISTING.id}`)
      expect(res.statusCode).toBe(200)
      expect(res.body.listing.id).toBe(MOCK_LISTING.id)
    })
  })

  describe('POST /annonces', () => {
    it('devrait créer une nouvelle annonce', async () => {
      const res = await request(app)
        .post('/annonces')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Nouvelle annonce', description: 'Desc', city: 'Lyon', pricePerNight: 80 })
      expect(res.statusCode).toBe(201)
      expect(res.body.listing).toHaveProperty('id')
    })

    it('devrait rejeter sans token', async () => {
      const res = await request(app)
        .post('/annonces')
        .send({ title: 'Test', city: 'Lyon', pricePerNight: 80 })
      expect(res.statusCode).toBe(401)
    })
  })

  describe('PUT /annonces/:id', () => {
    it('devrait mettre à jour une annonce', async () => {
      const res = await request(app)
        .put(`/annonces/${MOCK_LISTING.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Annonce mise à jour', pricePerNight: 120 })
      expect(res.statusCode).toBe(200)
      expect(res.body.listing.title).toBe('Annonce mise à jour')
    })
  })

  describe('DELETE /annonces/:id', () => {
    it('devrait supprimer une annonce', async () => {
      const res = await request(app)
        .delete(`/annonces/${MOCK_LISTING.id}`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
    })
  })
})
