FROM node:24-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

COPY src ./src
COPY server.js ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]