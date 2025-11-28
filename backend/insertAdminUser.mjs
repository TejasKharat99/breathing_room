import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

const DB_URI = 'mongodb://localhost:27017/breathing-room';
const ADMIN_EMAIL = 'admin@breathingroom.com';
const ADMIN_PASSWORD = 'Admin@123';

async function insertAdmin() {
  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const update = {
    firstName: 'Admin',
    lastName: 'User',
    phone: '0000000000',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
  };
  const result = await User.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('Admin user upserted:', result.email);
  process.exit(0);
}

insertAdmin().catch(err => { console.error(err); process.exit(1); });
