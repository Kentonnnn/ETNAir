import path from 'node:path'
import { defineConfig } from '@prisma/config'
import * as dotenv from 'dotenv'

dotenv.config()

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'node src/scripts/seed.js'
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})