import express from 'express';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to verify JWT and attach user to req
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Public: Get all venues
router.get('/', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Public: Get a single venue by ID
router.get('/:id', async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new venue (venue owner only, expects JSON with image URL)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'venue_owner') {
      return res.status(403).json({ error: 'Only venue owners can add venues' });
    }
    console.log('Venue POST body:', req.body);
    const { name, location, capacity, amenities, pricePerHour, pricePerDay, description, image } = req.body;
    const venue = new Venue({
      name,
      location,
      capacity,
      amenities: Array.isArray(amenities) ? amenities : amenities ? [amenities] : [],
      pricePerHour,
      pricePerDay,
      description,
      image,
      owner: mongoose.Types.ObjectId(req.user.id)
    });
    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    console.error('Error in POST /api/venues:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all venues for the logged-in venue owner
router.get('/my', authMiddleware, async (req, res) => {
  try {
    console.log('Decoded user:', req.user); 
    if (!req.user.role || req.user.role !== 'venue_owner') {
      return res.status(403).json({ error: 'Only venue owners can view their venues' });
    }
    const ownerId = mongoose.Types.ObjectId(req.user.id);
    const venues = await Venue.find({ owner: ownerId });
    res.json(venues);
  } catch (err) {
    console.error('Error in /api/venues/my:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Update a venue (venue owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'venue_owner') {
      return res.status(403).json({ error: 'Only venue owners can edit venues' });
    }
    const venue = await Venue.findOne({ _id: req.params.id, owner: req.user.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    Object.assign(venue, req.body);
    await venue.save();
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a venue (venue owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'venue_owner') {
      return res.status(403).json({ error: 'Only venue owners can delete venues' });
    }
    const venue = await Venue.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!venue) return res.status(404).json({ error: 'Venue not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
