import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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

console.log('Routes imported successfully');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});
console.log('✓ /health route registered');

const PORT = process.env.PORT || 3000;
console.log(`Starting server on port ${PORT}...`);

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Swagger documentation at http://localhost:${PORT}/api-docs`);
});