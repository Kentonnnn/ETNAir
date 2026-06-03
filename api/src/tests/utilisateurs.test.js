import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma.js'
import app from '../../server.js'

const MOCK_USER = {
  id: 1,
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'owner',
  listings: [],
}

const token = jwt.sign(
  { userId: MOCK_USER.id },
  process.env.JWT_SECRET || 'supersecretkey',
  { expiresIn: '1h' }
)

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Routes utilisateurs', () => {
  beforeEach(() => {
    // authMiddleware + controller appellent tous les deux findUnique
    prisma.user.findUnique.mockResolvedValue(MOCK_USER)
  })

  describe('GET /utilisateurs/:id', () => {
    it("devrait retourner les informations d'un utilisateur", async () => {
      const res = await request(app)
        .get(`/utilisateurs/${MOCK_USER.id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.user.email).toBe('admin@example.com')
    })

    it('devrait retourner 401 sans token', async () => {
      const res = await request(app).get(`/utilisateurs/${MOCK_USER.id}`)
      expect(res.statusCode).toBe(401)
    })
  })

  describe('PUT /utilisateurs/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      prisma.user.update.mockResolvedValue({ ...MOCK_USER, firstName: 'Updated', lastName: 'Name' })

      const res = await request(app)
        .put(`/utilisateurs/${MOCK_USER.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ firstName: 'Updated', lastName: 'Name' })

      expect(res.statusCode).toBe(200)
      expect(res.body.user.firstName).toBe('Updated')
    })
  })

  describe('DELETE /utilisateurs/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      const userToDelete = { id: 2, email: 'delete@example.com', firstName: 'Delete', lastName: 'Me', role: 'tenant' }
      // 1er appel: authMiddleware → admin, 2ème appel: controller → userToDelete
      prisma.user.findUnique
        .mockResolvedValueOnce(MOCK_USER)
        .mockResolvedValueOnce(userToDelete)
      prisma.user.delete.mockResolvedValue(userToDelete)

      const res = await request(app)
        .delete(`/utilisateurs/${userToDelete.id}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
    })
  })
})
