import request from 'supertest';
import app from '../../server.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
let token;
let userId;
let listingId;

describe('Routes annonces', () => {
  beforeAll(async () => {
    await prisma.listings.deleteMany({});
    await prisma.users.deleteMany({});

    const user = await prisma.users.create({
      data: {
        first_name: 'Owner',
        last_name: 'User',
        email: 'owner@example.com',
        password_hash: 'hashed_password',
        user_role: 'owner',
      },
    });

    userId = user.id;
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const listing = await prisma.listings.create({
      data: {
        title: 'Bel appartement à Paris',
        description: 'Spacieux et moderne',
        city: 'Paris',
        price_per_night: 100,
        available_from: new Date(),
        available_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        owner_id: userId,
      },
    });

    listingId = listing.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /annonces', () => {
    it('devrait retourner toutes les annonces', async () => {
      const res = await request(app)
        .get('/annonces');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.listings)).toBe(true);
    });

    it('devrait supporter la pagination', async () => {
      const res = await request(app)
        .get('/annonces?page=1&limit=10');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('limit');
    });
  });

  describe('GET /annonces/:id', () => {
    it('devrait retourner une annonce par ID', async () => {
      const res = await request(app)
        .get(`/annonces/${listingId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.listing.id).toBe(listingId);
    });
  });

  describe('POST /annonces', () => {
    it('devrait créer une nouvelle annonce', async () => {
      const res = await request(app)
        .post('/annonces')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Nouvelle annonce',
          description: 'Description',
          city: 'Lyon',
          price_per_night: 80,
          available_from: new Date(),
          available_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.listing).toHaveProperty('id');
    });

    it('devrait rejeter sans token', async () => {
      const res = await request(app)
        .post('/annonces')
        .send({
          title: 'Nouvelle annonce',
          description: 'Description',
          city: 'Lyon',
          price_per_night: 80,
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /annonces/:id', () => {
    it('devrait mettre à jour une annonce', async () => {
      const res = await request(app)
        .put(`/annonces/${listingId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Annonce mise à jour',
          price_per_night: 120,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.listing.title).toBe('Annonce mise à jour');
    });
  });

  describe('DELETE /annonces/:id', () => {
    it('devrait supprimer une annonce', async () => {
      const listing = await prisma.listings.create({
        data: {
          title: 'À supprimer',
          description: 'Description',
          city: 'Marseille',
          price_per_night: 90,
          available_from: new Date(),
          available_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          owner_id: userId,
        },
      });

      const res = await request(app)
        .delete(`/annonces/${listing.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });
});