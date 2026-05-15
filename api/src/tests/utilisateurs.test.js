import request from 'supertest';
import app from '../../server.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
let token;
let userId;

describe('Routes utilisateurs', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({});
    
    const user = await prisma.user.create({
      data: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'hashed_password',
        role: 'owner',
      },
    });
    
    userId = user.id;
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /utilisateurs/:id', () => {
    it('devrait retourner les informations d\'un utilisateur', async () => {
      const res = await request(app)
        .get(`/utilisateurs/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user.email).toBe('admin@example.com');
    });

    it('devrait retourner 401 sans token', async () => {
      const res = await request(app)
        .get(`/utilisateurs/${userId}`);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /utilisateurs/:id', () => {
    it('devrait mettre à jour un utilisateur', async () => {
      const res = await request(app)
        .put(`/utilisateurs/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.firstName).toBe('Updated');
    });
  });

  describe('DELETE /utilisateurs/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      const newUser = await prisma.user.create({
        data: {
          firstName: 'Delete',
          lastName: 'Me',
          email: 'delete@example.com',
          password: 'hashed_password',
          role: 'tenant',
        },
      });

      const res = await request(app)
        .delete(`/utilisateurs/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      
      const deleted = await prisma.user.findUnique({
        where: { id: newUser.id },
      });
      expect(deleted).toBeNull();
    });
  });
});