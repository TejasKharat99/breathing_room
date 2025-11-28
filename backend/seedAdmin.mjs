import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/breathing-room';
const ADMIN_EMAIL = 'admin@breathingroom.com';
const ADMIN_PASSWORD = 'Admin@123';

async function createAdmin() {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('Admin user already exists');
    process.exit(0);
  }
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = new User({
    firstName: 'Admin',
    lastName: 'User',
    phone: '0000000000',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
  });
  await admin.save();
  console.log('Admin user created');
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
