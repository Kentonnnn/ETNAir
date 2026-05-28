#!/bin/sh
set -e

echo "Waiting for database at ${DB_HOST:-db}:${DB_PORT:-5432}..."
while ! nc -z "${DB_HOST:-db}" "${DB_PORT:-5432}"; do
  echo "Database not ready, sleeping 1s..."
  sleep 1
 done

echo "Database is ready."

echo "Deploying Prisma migrations..."
npx prisma migrate deploy

echo "Seeding database if needed..."
node src/scripts/seed.js

echo "Starting ETNAir API..."
exec node server.js
