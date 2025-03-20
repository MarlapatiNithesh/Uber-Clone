const mongoose = require('mongoose');

async function connectToDb() {
    try {
        await mongoose.connect(process.env.DB_CONNECT).then(()=>console.log('Connected to DB'))
    } catch (error) {
        console.error('DB Connection Error:', error);
    }
}

module.exports = connectToDb;
