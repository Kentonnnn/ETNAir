import request from 'supertest';
import app from '../../server.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Routes d\'authentification', () => {
  beforeAll(async () => {
    await prisma.users.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('john@example.com');
    });

    it('devrait rejeter un email invalide', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
    });

    it('devrait rejeter un mot de passe trop court', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Jane',
          last_name: 'Doe',
          email: 'jane@example.com',
          password: '123',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/auth/register')
        .send({
          first_name: 'Test',
          last_name: 'User',
          email: 'test@example.com',
          password: 'password123',
        });
    });

    it('devrait retourner un token JWT valide', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.token).toBeTruthy();
    });

    it('devrait rejeter des identifiants invalides', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });
});