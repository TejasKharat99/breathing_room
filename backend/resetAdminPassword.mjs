import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/breathing-room';
const ADMIN_EMAIL = 'admin@breathingroom.com';
const NEW_PASSWORD = 'Admin@123';

async function resetAdminPassword() {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    console.log('No admin user found to reset');
    process.exit(1);
  }
  const hashedPassword = await bcrypt.hash(NEW_PASSWORD, 10);
  admin.password = hashedPassword;
  await admin.save();
  console.log('Admin password reset successfully');
  process.exit(0);
}

resetAdminPassword().catch(err => { console.error(err); process.exit(1); });
