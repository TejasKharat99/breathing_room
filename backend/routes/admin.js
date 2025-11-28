import express from 'express';
import User from '../models/User.js';
import Venue from '../models/Venue.js';
import { authenticateJWT, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check admin
// function requireAdmin(req, res, next) {
//   // Assume req.user is set by auth middleware (JWT)
//   if (!req.user || req.user.role !== 'admin') {
//     return res.status(403).json({ error: 'Forbidden' });
//   }
//   next();
// }

// Protect all admin routes with JWT and admin check
router.use(authenticateJWT, requireAdmin);

// Get all users
router.get('/users', async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

// Get all venues
router.get('/venues', async (req, res) => {
  const venues = await Venue.find();
  res.json(venues);
});

// Delete a venue
router.delete('/venues/:id', async (req, res) => {
  await Venue.findByIdAndDelete(req.params.id);
  res.json({ message: 'Venue deleted' });
});

// Analytics (counts)
router.get('/analytics', async (req, res) => {
  const userCount = await User.countDocuments();
  const venueCount = await Venue.countDocuments();
  res.json({ userCount, venueCount });
});

export default router;
