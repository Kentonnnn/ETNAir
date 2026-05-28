import { prisma } from '../lib/prisma.js';

export const createAnnonce = async (req, res) => {
  console.log('[createAnnonce] files:', req.files?.length ?? 0, '| content-type:', req.headers['content-type']?.slice(0, 50), '| images in body:', req.body.images);
  try {
    const { title, description, city, pricePerNight, availableFrom, availableTo } = req.body;
    const ownerId = req.userId;

    if (!ownerId) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

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
        ownerId,
      },
    });

    if (req.files && req.files.length > 0) {
      const imageData = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        key: file.filename,
        listingId: listing.id,
      }));
      await prisma.listingImage.createMany({ data: imageData });
    }

    const createdListing = await prisma.listing.findUnique({
      where: { id: listing.id },
      include: {
        owner: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        images: true,
      },
    });

    res.status(201).json({ listing: createdListing });
  } catch (error) {
    console.error('createAnnonce error:', error);
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
        },
        images: true
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
        images: true,
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
    const { title, description, city, pricePerNight, availableFrom, availableTo, removeImageIds } = req.body;

    const listing = await prisma.listing.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.ownerId !== ownerId) return res.status(403).json({ error: 'Forbidden' });

    if (removeImageIds) {
      const ids = String(removeImageIds).split(',').map(Number).filter(Boolean);
      if (ids.length) {
        await prisma.listingImage.deleteMany({ where: { id: { in: ids }, listingId: parseInt(id) } });
      }
    }

    if (req.files && req.files.length > 0) {
      const imageData = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        key: file.filename,
        listingId: parseInt(id),
      }));
      await prisma.listingImage.createMany({ data: imageData });
    }

    const updated = await prisma.listing.update({
      where: { id: parseInt(id) },
      data: {
        title: title || listing.title,
        description: description !== undefined ? description : listing.description,
        city: city || listing.city,
        pricePerNight: pricePerNight ? parseFloat(pricePerNight) : listing.pricePerNight,
        availableFrom: availableFrom ? new Date(availableFrom) : listing.availableFrom,
        availableTo: availableTo ? new Date(availableTo) : listing.availableTo,
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        images: true,
      },
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