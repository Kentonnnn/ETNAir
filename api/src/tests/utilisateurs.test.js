import request from 'supertest';
import app from '../../server.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let token;
let userId;

describe('Routes utilisateurs', () => {
  beforeAll(async () => {
    await prisma.users.deleteMany({});
    
    const user = await prisma.users.create({
      data: {
        first_name: 'Admin',
        last_name: 'User',
        email: 'admin@example.com',
        password_hash: 'hashed_password',
        user_role: 'owner',
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
          first_name: 'Updated',
          last_name: 'Name',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.first_name).toBe('Updated');
    });
  });

  describe('DELETE /utilisateurs/:id', () => {
    it('devrait supprimer un utilisateur', async () => {
      const newUser = await prisma.users.create({
        data: {
          first_name: 'Delete',
          last_name: 'Me',
          email: 'delete@example.com',
          password_hash: 'hashed_password',
          user_role: 'tenant',
        },
      });

      const res = await request(app)
        .delete(`/utilisateurs/${newUser.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      
      const deleted = await prisma.users.findUnique({
        where: { id: newUser.id },
      });
      expect(deleted).toBeNull();
    });
  });
});