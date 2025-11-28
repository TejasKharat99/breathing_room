import express from 'express';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.role || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admins only' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Get all bookings (admin only)
router.get('/', adminAuthMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('venue').populate('user');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
