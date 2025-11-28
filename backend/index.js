import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Models (example)
import Venue from './models/Venue.js';
import authRoutes from './routes/auth.js';
import venueRoutes from './routes/venues.js';
import adminRoutes from './routes/admin.js';
import bookingRoutes from './routes/bookings.js';
import adminBookingRoutes from './routes/adminBookings.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Sample route: Get all venues
app.get('/api/venues', async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);

// Serve React build
import path from 'path';
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
