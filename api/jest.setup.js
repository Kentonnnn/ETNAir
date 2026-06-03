const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.test or .env
dotenv.config({ path: path.join(__dirname, '.env.test') });
dotenv.config({ path: path.join(__dirname, '.env') });

// Set test environment
process.env.NODE_ENV = 'test';
