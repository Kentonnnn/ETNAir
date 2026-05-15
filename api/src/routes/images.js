const express = require('express');
const router = express.Router();
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const verifyToken = require('../middleware/auth');

// Configuration MinIO (S3 compatible)
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

// Upload image
router.post('/upload', verifyToken, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier fourni' });
    }

    const fileContent = fs.readFileSync(req.file.path);
    const key = `listings/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));
    
    // Supprimer le fichier local
    fs.unlinkSync(req.file.path);

    const imageUrl = `${process.env.MINIO_URL}/${BUCKET_NAME}/${key}`;

    res.status(200).json({
      message: 'Image uploadée avec succès',
      imageUrl: imageUrl,
      key: key,
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ message: 'Erreur lors de l\'upload' });
  }
});

// Delete image
router.delete('/:imageKey', verifyToken, async (req, res) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: req.params.imageKey,
    };

    await s3Client.send(new DeleteObjectCommand(params));

    res.status(200).json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error('Erreur suppression:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

module.exports = router;