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

    // 35 utilisateurs Faker (25 owners + 10 tenants)
    for (let i = 0; i < 35; i++) {
      const role = i < 25 ? 'owner' : 'tenant';
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
    }
    console.log('35 utilisateurs créés');

    const CITIES = [
      { name: 'Paris',         lat: 48.8566, lng: 2.3522 },
      { name: 'Lyon',          lat: 45.7640, lng: 4.8357 },
      { name: 'Marseille',     lat: 43.2965, lng: 5.3698 },
      { name: 'Bordeaux',      lat: 44.8378, lng: -0.5792 },
      { name: 'Toulouse',      lat: 43.6047, lng: 1.4442 },
      { name: 'Nice',          lat: 43.7102, lng: 7.2620 },
      { name: 'Nantes',        lat: 47.2184, lng: -1.5536 },
      { name: 'Strasbourg',    lat: 48.5734, lng: 7.7521 },
      { name: 'Montpellier',   lat: 43.6110, lng: 3.8767 },
      { name: 'Lille',         lat: 50.6292, lng: 3.0573 },
      { name: 'Rennes',        lat: 48.1173, lng: -1.6778 },
      { name: 'Grenoble',      lat: 45.1885, lng: 5.7245 },
      { name: 'Dijon',         lat: 47.3220, lng: 5.0415 },
      { name: 'Angers',        lat: 47.4784, lng: -0.5632 },
      { name: 'Reims',         lat: 49.2583, lng: 4.0317 },
      { name: 'Saint-Étienne', lat: 45.4397, lng: 4.3872 },
      { name: 'Le Havre',      lat: 49.4944, lng: 0.1079 },
      { name: 'Toulon',        lat: 43.1242, lng: 5.9280 },
      { name: 'Brest',         lat: 48.3905, lng: -4.4860 },
      { name: 'Limoges',       lat: 45.8336, lng: 1.2611 },
      { name: 'Tours',         lat: 47.3941, lng: 0.6848 },
      { name: 'Amiens',        lat: 49.8941, lng: 2.2957 },
      { name: 'Metz',          lat: 49.1193, lng: 6.1757 },
      { name: 'Besançon',      lat: 47.2378, lng: 6.0241 },
      { name: 'Orléans',       lat: 47.9029, lng: 1.9039 },
      { name: 'Mulhouse',      lat: 47.7508, lng: 7.3359 },
      { name: 'Rouen',         lat: 49.4432, lng: 1.0993 },
      { name: 'Caen',          lat: 49.1829, lng: -0.3707 },
      { name: 'Nancy',         lat: 48.6921, lng: 6.1844 },
      { name: 'Avignon',       lat: 43.9493, lng: 4.8055 },
      { name: 'Poitiers',      lat: 46.5802, lng: 0.3404 },
      { name: 'La Rochelle',   lat: 46.1591, lng: -1.1520 },
      { name: 'Pau',           lat: 43.2951, lng: -0.3708 },
      { name: 'Annecy',        lat: 45.8992, lng: 6.1294 },
      { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870 },
    ];

    // ── Titres et descriptions réalistes ──
    const ADJECTIVES = ['Charmant', 'Lumineux', 'Spacieux', 'Cosy', 'Moderne', 'Élégant', 'Atypique', 'Confortable', 'Authentique', 'Rénové', 'Design', 'Calme', 'Chaleureux'];
    const TYPES = ['Studio', 'T1', 'T2', 'T3', 'Appartement', 'Loft', 'Duplex', 'Chambre meublée', 'Pied-à-terre', 'Maisonnette'];
    const FEATURES_DESC = [
      'Idéal pour étudiant, proche des transports et des commerces.',
      'À deux pas du centre-ville, du campus et des restaurants.',
      'Entièrement meublé et équipé, prêt à emménager.',
      'Quartier calme et agréable, parfait pour les études.',
      'Vue dégagée, beaucoup de luminosité, balcon ou terrasse.',
      'Cuisine équipée, salle de bain moderne, internet inclus.',
      'Charges et internet haut débit compris dans le loyer.',
      'À proximité de la gare et des lignes de tramway.',
      'Logement rénové avec goût, prestations de qualité.',
    ];

    function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function makeTitle(city) {
      return `${pick(ADJECTIVES)} ${pick(TYPES)} à ${city.name}`;
    }
    function makeDescription() {
      return `${pick(FEATURES_DESC)} ${pick(FEATURES_DESC)} ${faker.lorem.sentence()}`;
    }

    // Entre 4 et 6 annonces par owner → ~100-150 listings
    const owners = users.filter(user => user.role === 'owner');

    let listingCount = 0;
    for (const owner of owners) {
      const nbListings = 4 + Math.floor(Math.random() * 3); // 4-6
      for (let j = 0; j < nbListings; j++) {
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const jitter = () => (Math.random() - 0.5) * 0.08;
        await prisma.listing.create({
          data: {
            title: makeTitle(city),
            description: makeDescription(),
            city: city.name,
            latitude: city.lat + jitter(),
            longitude: city.lng + jitter(),
            pricePerNight: parseFloat(
              faker.commerce.price({ min: 35, max: 280 })
            ),
            availableFrom: faker.date.soon(),
            availableTo: faker.date.future(),
            ownerId: owner.id,
          },
        });
        listingCount++;
      }
    }

    console.log(`✅ Base de données peuplée : ${listingCount} annonces dans ${CITIES.length} villes`);
  } catch (error) {
    console.error('Erreur lors du seeding :', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();