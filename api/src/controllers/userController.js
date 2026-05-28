import { prisma } from '../lib/prisma.js';

export const getAllUtilisateurs = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        listings: { include: { images: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const { firstName, lastName, email } = req.body;

    const Utilisateur = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!Utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const updatedUtilisateur = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { firstName, lastName, email }
    });

    res.json({ user: updatedUtilisateur });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUtilisateur = async (req, res) => {
  try {
    const { id } = req.params;

    const Utilisateur = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!Utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Utilisateur supprimé avec succès !' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};