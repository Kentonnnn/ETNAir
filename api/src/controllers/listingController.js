import { prisma } from '../lib/prisma.js';

export const createAnnonce = async (req, res) => {
  try {
    const { title, description, city, pricePerNight, availableFrom, availableTo } = req.body;
    const ownerId = req.userId;

    if (!title || !city || !pricePerNight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        city,
        pricePerNight: parseFloat(pricePerNight),
        availableFrom: availableFrom ? new Date(availableFrom) : null,
        availableTo: availableTo ? new Date(availableTo) : null,
        ownerId
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.status(201).json({ listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAnnonces = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const listings = await prisma.listing.findMany({
      skip,
      take: limit,
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ listings, page, limit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        reviews: true
      }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;
    const { title, description, city, pricePerNight, availableFrom, availableTo } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        title: title || listing.title,
        description: description || listing.description,
        city: city || listing.city,
        pricePerNight: pricePerNight ? parseFloat(pricePerNight) : listing.pricePerNight,
        availableFrom: availableFrom ? new Date(availableFrom) : listing.availableFrom,
        availableTo: availableTo ? new Date(availableTo) : listing.availableTo
      },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true }
        }
      }
    });

    res.json({ listing: updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAnnonce = async (req, res) => {
  try {
    const { id } = req.params;
    const ownerId = req.userId;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.ownerId !== ownerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await prisma.listing.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};