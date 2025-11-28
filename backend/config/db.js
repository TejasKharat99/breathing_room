import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const dbName = 'breathing-room';
const baseUri = (process.env.MONGODB_URI || 'mongodb://localhost:27017').replace(/\/+$/, '');
const dbUri = `${baseUri}/${dbName}`;

console.log('Attempting MongoDB connection with URI:', dbUri);

const connectDB = async () => {
  try {
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected to', dbUri);
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
