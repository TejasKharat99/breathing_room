import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/breathing-room';

async function checkAdmin() {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const admin = await User.findOne({ email: 'admin@breathingroom.com' });
  if (!admin) {
    console.log('No admin user found');
  } else {
    console.log('Admin user:', admin);
  }
  process.exit(0);
}

checkAdmin().catch(err => { console.error(err); process.exit(1); });
