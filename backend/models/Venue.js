import mongoose from 'mongoose';

const VenueSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [{ type: String }],
  pricePerHour: { type: Number, required: true },
  pricePerDay: { type: Number },
  description: { type: String },
  photos: [{ type: String }],
  image: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Venue = mongoose.model('Venue', VenueSchema);
export default Venue;
