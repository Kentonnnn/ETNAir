const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {
    console.log('Début du seeding...');

    // =========================
    // CREATION DES UTILISATEURS
    // =========================
    const users = [];

    for (let i = 0; i < 10; i++) {
      const role = i < 5 ? 'owner' : 'tenant';

      const user = await prisma.users.create({
        data: {
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          password_hash: faker.internet.password(),
          user_role: role,
        },
      });

      users.push(user);

      console.log(`Utilisateur créé : ${user.first_name} ${user.last_name}`);
    }

    // =========================
    // CREATION DES ANNONCES
    // =========================
    const listings = [];

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

        listings.push(listing);

        console.log(`Annonce créée : ${listing.title}`);
      }
    }

    // =========================
    // CREATION DES RESERVATIONS
    // =========================
    const tenants = users.filter(user => user.user_role === 'tenant');

    const bookings = [];

    for (const tenant of tenants) {
      const randomListing =
        listings[Math.floor(Math.random() * listings.length)];

      const startDate = faker.date.soon();
      const endDate = faker.date.future();

      const booking = await prisma.bookings.create({
        data: {
          start_date: startDate,
          end_date: endDate,
          total_price: parseFloat(
            faker.commerce.price({ min: 100, max: 1500 })
          ),
          status: faker.helpers.arrayElement([
            'pending',
            'confirmed',
            'cancelled',
          ]),
          user_id: tenant.id,
          listing_id: randomListing.id,
        },
      });

      bookings.push(booking);

      console.log(`Réservation créée : ${booking.id}`);
    }

    // =========================
    // CREATION DES AVIS
    // =========================
    for (const tenant of tenants) {
      const randomListing =
        listings[Math.floor(Math.random() * listings.length)];

      const review = await prisma.reviews.create({
        data: {
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.sentences(2),
          user_id: tenant.id,
          listing_id: randomListing.id,
        },
      });

      console.log(`Avis créé : ${review.id}`);
    }

    // =========================
    // CREATION DES PAIEMENTS
    // =========================
    for (const booking of bookings) {
      const payment = await prisma.payments.create({
        data: {
          booking_id: booking.id,
          amount: booking.total_price,
          payment_method: faker.helpers.arrayElement([
            'credit card',
            'paypal',
            'bank transfer',
          ]),
          payment_status: faker.helpers.arrayElement([
            'on hold',
            'paid',
            'unpaid',
          ]),
          paid_at: faker.date.recent(),
        },
      });

      console.log(`Paiement créé : ${payment.id}`);
    }

    console.log('Base de données peuplée avec succès !');
  } catch (error) {
    console.error('Erreur lors du seeding :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
