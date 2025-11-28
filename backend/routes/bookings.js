import express from 'express';
import Booking from '../models/Booking.js';
import Venue from '../models/Venue.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

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

// Create a new booking (user only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { venueId, bookingType, date, endDate, startTime, endTime, days, hours, total } = req.body;
    const venue = await Venue.findById(venueId);
    if (!venue) return res.status(404).json({ error: 'Venue not found' });

    // Overlap check for day bookings
    if (bookingType === 'day') {
      // Find bookings for this venue that overlap with the requested range
      const conflicts = await Booking.find({
        venue: venueId,
        bookingType: 'day',
        $or: [
          { date: { $lte: endDate }, endDate: { $gte: date } }, // overlap
        ]
      });
      if (conflicts.length > 0) {
        // Record conflict for admin
        await Booking.create({
          user: req.user.id,
          venue: venueId,
          bookingType,
          date,
          endDate,
          days,
          total,
          conflict: true
        });
        return res.status(409).json({ error: 'Booking conflict: overlapping dates.' });
      }
    }
    // Overlap check for hour bookings (same date, time overlap)
    if (bookingType === 'hour') {
      const conflicts = await Booking.find({
        venue: venueId,
        bookingType: 'hour',
        date,
        $or: [
          { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
      });
      if (conflicts.length > 0) {
        await Booking.create({
          user: req.user.id,
          venue: venueId,
          bookingType,
          date,
          startTime,
          endTime,
          hours,
          total,
          conflict: true
        });
        return res.status(409).json({ error: 'Booking conflict: overlapping time.' });
      }
    }
    // If no conflict, save normal booking
    const booking = new Booking({
      user: req.user.id,
      venue: venueId,
      bookingType,
      date,
      endDate,
      startTime,
      endTime,
      days,
      hours,
      total,
      conflict: false
    });
    await booking.save();
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all bookings for the logged-in user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('venue');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
