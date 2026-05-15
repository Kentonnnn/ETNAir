FROM node:24-alpine
WORKDIR /app

# copy package files first for proper layer caching
COPY package*.json ./
RUN npm install

# copy Prisma files before generating the client
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

# copy application source
COPY src ./src
COPY server.js ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]