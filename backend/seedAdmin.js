// Script to create an admin user in MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const DB_URI = require('./config/db');

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
    email: ADMIN_EMAIL,
    password: hashedPassword,
    roles: ['admin'],
    name: 'Admin',
  });
  await admin.save();
  console.log('Admin user created');
  process.exit(0);
}

createAdmin().catch(err => { console.error(err); process.exit(1); });
