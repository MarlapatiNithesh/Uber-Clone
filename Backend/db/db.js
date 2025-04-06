const mongoose = require('mongoose');
require('dotenv').config(); // Load .env file

async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ DB Connection Error:', error.message);
        process.exit(1); // Exit process if connection fails
    }
}

module.exports = connectToDb;
