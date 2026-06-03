import { prisma } from '../lib/prisma.js';

export const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        listing: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
            images: true,
          },
        },
      },
    });
    res.json({ listings: favorites.map(f => f.listing) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFavoriteIds = async (req, res) => {
  try {
    const userId = req.userId;
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { listingId: true },
    });
    res.json({ favoriteIds: favorites.map(f => f.listingId) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const listingId = parseInt(req.params.listingId);
    await prisma.favorite.create({ data: { userId, listingId } });
    res.status(201).json({ message: 'Ajouté aux favoris' });
  } catch (error) {
    if (error.code === 'P2002') return res.status(409).json({ error: 'Déjà en favoris' });
    res.status(500).json({ error: error.message });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const listingId = parseInt(req.params.listingId);
    await prisma.favorite.deleteMany({ where: { userId, listingId } });
    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
