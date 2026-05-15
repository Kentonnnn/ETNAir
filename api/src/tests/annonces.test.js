import request from 'supertest';
import app from '../../server.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
let token;
let userId;
let listingId;

describe('Routes annonces', () => {
  beforeAll(async () => {
    await prisma.listing.deleteMany({});
    await prisma.user.deleteMany({});

    const user = await prisma.user.create({
      data: {
        firstName: 'Owner',
        lastName: 'User',
        email: 'owner@example.com',
        password: 'hashed_password',
        role: 'owner',
      },
    });

    userId = user.id;
    token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    const listing = await prisma.listing.create({
      data: {
        title: 'Bel appartement à Paris',
        description: 'Spacieux et moderne',
        city: 'Paris',
        pricePerNight: 100,
        availableFrom: new Date(),
        availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        ownerId: userId,
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
          pricePerNight: 80,
          availableFrom: new Date(),
          availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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
          pricePerNight: 80,
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
          pricePerNight: 120,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.listing.title).toBe('Annonce mise à jour');
    });
  });

  describe('DELETE /annonces/:id', () => {
    it('devrait supprimer une annonce', async () => {
      const listing = await prisma.listing.create({
        data: {
          title: 'À supprimer',
          description: 'Description',
          city: 'Marseille',
          pricePerNight: 90,
          availableFrom: new Date(),
          availableTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          ownerId: userId,
        },
      });

      const res = await request(app)
        .delete(`/annonces/${listing.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
    });
  });
});