import { verifyToken } from '../utils/jwt.js';
import { prisma } from '../lib/prisma.js';

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Aucun token fourni' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: 'Token invalide ou expiré' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    res.status(401).json({ error: 'Utilisateur introuvable' });
    return;
  }

  req.userId = user.id;
  next();
};