import { prisma } from '../lib/prisma.js';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

async function seedDatabase() {
  try {
    // Vérifie si le seed a déjà été lancé
    const seedUser = await prisma.user.findFirst({
      where: { email: 'seed@etnair.com' }
    });

    if (seedUser) {
      console.log('Base déjà peuplée, seed ignoré.');
      await prisma.$disconnect();
      return;
    }

    console.log('Début du seeding...');

    const users = [];

    // Utilisateur sentinelle fixe pour détecter si le seed a déjà tourné
    const hashedPassword = await bcrypt.hash('password123', 10);
    const sentinel = await prisma.user.create({
      data: {
        firstName: 'Seed',
        lastName: 'ETNAir',
        email: 'seed@etnair.com',
        password: hashedPassword,
        role: 'owner',
      },
    });
    users.push(sentinel);
    console.log('Utilisateur sentinelle créé : seed@etnair.com');

    // 10 utilisateurs Faker (5 owners + 5 tenants)
    for (let i = 0; i < 10; i++) {
      const role = i < 5 ? 'owner' : 'tenant';
      const hashedPwd = await bcrypt.hash('password123', 10);

      const user = await prisma.user.create({
        data: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          password: hashedPwd,
          role: role,
        },
      });

      users.push(user);
      console.log(`Utilisateur créé : ${user.firstName} ${user.lastName}`);
    }

    // 3 annonces par owner
    const owners = users.filter(user => user.role === 'owner');

    for (const owner of owners) {
      for (let j = 0; j < 3; j++) {
        const listing = await prisma.listing.create({
          data: {
            title: faker.company.catchPhrase(),
            description: faker.lorem.paragraph(),
            city: faker.location.city(),
            pricePerNight: parseFloat(
              faker.commerce.price({ min: 40, max: 300 })
            ),
            availableFrom: faker.date.soon(),
            availableTo: faker.date.future(),
            ownerId: owner.id,
          },
        });

        console.log(`Annonce créée : ${listing.title}`);
      }
    }

    console.log('Base de données peuplée avec succès !');
  } catch (error) {
    console.error('Erreur lors du seeding :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();