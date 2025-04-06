// db.js
const mongoose = require('mongoose');

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ DB Connection Error:', error.message);
    process.exit(1);
  }
}

module.exports = connectToDb;
