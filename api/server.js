// Load environment variables only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  import('dotenv/config');
}

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import imageRoutes from './src/routes/images.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting server...');
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  JWT_SECRET: process.env.JWT_SECRET ? '***set***' : 'NOT SET',
  DATABASE_URL: process.env.DATABASE_URL ? '***set***' : 'NOT SET',
  PORT: process.env.PORT || 3000
});

import authRoutes from './src/routes/auth.js';
import userRoutes from './src/routes/utilisateurs.js';
import listingRoutes from './src/routes/listings.js';
import favoriteRoutes from './src/routes/favorites.js';

console.log('Routes imported successfully');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://172.16.248.98', 'https://172.16.248.98'],
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

console.log('Middleware configured');

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ETNAir API',
      version: '1.0.0',
      description: 'API for ETNAir application'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log('Swagger configured');

// Routes
console.log('Registering routes...');
app.use('/auth', authRoutes);
console.log('✓ /auth routes registered');

app.use('/utilisateurs', userRoutes);
console.log('✓ /utilisateurs routes registered');

app.use('/annonces', listingRoutes);
console.log('✓ /annonces routes registered');

app.use('/images', imageRoutes);
console.log('✓ /images routes registered');

app.use('/favoris', favoriteRoutes);
console.log('✓ /favoris routes registered');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});
console.log('✓ /health route registered');

const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Swagger documentation at http://localhost:${PORT}/api-docs`);
  });
}

export default app;