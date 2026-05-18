const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Début du seeding...');

    await prisma.users.deleteMany({});
    await prisma.listings.deleteMany({});

    const users = [];

    for (let i = 0; i < 10; i++) {
      const role = i < 5 ? 'owner' : 'tenant';
      const hashedPassword = await bcrypt.hash('password123', 10);

      const user = await prisma.users.create({
        data: {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          password_hash: hashedPassword,
          user_role: role,
        },
      });

      users.push(user);
      console.log(`Utilisateur créé : ${user.first_name} ${user.last_name}`);
    }

    const owners = users.filter(user => user.user_role === 'owner');

    for (const owner of owners) {
      for (let j = 0; j < 3; j++) {
        const listing = await prisma.listings.create({
          data: {
            title: faker.company.catchPhrase(),
            description: faker.lorem.paragraph(),
            city: faker.location.city(),
            price_per_night: parseFloat(
              faker.commerce.price({ min: 40, max: 300 })
            ),
            available_from: faker.date.soon(),
            available_to: faker.date.future(),
            owner_id: owner.id,
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