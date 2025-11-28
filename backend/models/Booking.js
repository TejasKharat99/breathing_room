import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  bookingType: { type: String, enum: ['hour', 'day'], required: true },
  date: { type: String }, // for hourly or start date for daily
  endDate: { type: String }, // only for daily
  startTime: { type: String }, // only for hourly
  endTime: { type: String }, // only for hourly
  days: { type: Number }, // only for daily
  hours: { type: Number }, // only for hourly
  total: { type: Number, required: true },
  conflict: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', BookingSchema);
