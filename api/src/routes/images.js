import express from 'express';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

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

router.post('/upload', authMiddleware, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const key = `listings/${Date.now()}-${req.file.originalname}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    const imageUrl = `${process.env.MINIO_URL}/${BUCKET_NAME}/${key}`;
    res.status(200).json({ message: 'Image uploadée avec succès', imageUrl, key });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload' });
  }
});

router.delete('/:imageKey', authMiddleware, async (req, res) => {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: req.params.imageKey,
    }));
    res.status(200).json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;
