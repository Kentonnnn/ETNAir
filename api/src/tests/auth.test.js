import { jest, describe, it, expect, beforeAll, beforeEach, afterAll } from '@jest/globals'
import request from 'supertest'
// moduleNameMapper remplace automatiquement prisma.js par le mock
import { prisma } from '../lib/prisma.js'
import app from '../../server.js'

let hashedPwd

beforeAll(async () => {
  const bcrypt = await import('bcrypt')
  hashedPwd = await bcrypt.default.hash('password123', 10)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe("Routes d'authentification", () => {
  describe('POST /auth/register', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue(null)
      prisma.user.create.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'tenant',
      })
    })

    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app).post('/auth/register').send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      })
      expect(res.statusCode).toBe(201)
      expect(res.body.user).toHaveProperty('id')
      expect(res.body.user.email).toBe('john@example.com')
    })

    it('devrait rejeter un email invalide', async () => {
      const res = await request(app).post('/auth/register').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'invalid-email',
        password: 'password123',
      })
      expect(res.statusCode).toBe(400)
    })

    it('devrait rejeter un mot de passe trop court', async () => {
      const res = await request(app).post('/auth/register').send({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: '123',
      })
      expect(res.statusCode).toBe(400)
    })
  })

  describe('POST /auth/login', () => {
    beforeEach(() => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPwd,
        role: 'tenant',
      })
    })

    it('devrait retourner un token JWT valide', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body.token).toBeTruthy()
    })

    it('devrait rejeter des identifiants invalides', async () => {
      const res = await request(app).post('/auth/login').send({
        email: 'test@example.com',
        password: 'wrongpassword',
      })
      expect(res.statusCode).toBe(401)
    })
  })
})
