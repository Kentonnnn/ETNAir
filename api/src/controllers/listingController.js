import { prisma } from '../lib/prisma.js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: process.env.MINIO_URL || 'http://localhost:9000',
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'listings';

const uploadToMinio = async (file) => {
  const key = `listings/${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  await s3Client.send(new PutObjectCommand(params));
  return {
    url: `${process.env.MINIO_URL}/${BUCKET_NAME}/${key}`,
    key,
  };
};

export const createAnnonce = async (req, res) => {
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
      const imageData = [];
      for (const file of req.files) {
        const uploaded = await uploadToMinio(file);
        imageData.push({ url: uploaded.url, key: uploaded.key, listingId: listing.id });
      }
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