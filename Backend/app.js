const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectToDb = require('./db/db.js');
const userRoutes = require('./routes/user.routes.js');
const captainRoutes = require('./routes/captain.routes.js');
const mapRoutes = require('./routes/map.routes.js');
const rideRoutes = require('./routes/ride.routes.js');

const app = express();
connectToDb();

// ✅ CORS fix for frontend deployment and local dev
const allowedOrigins = [
  'https://uber-clone-frontend-jjai.onrender.com',
  'http://localhost:5173',
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.get('/', (req, res) => {
  res.send('Hello world!');
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapRoutes);
app.use('/rides', rideRoutes);

module.exports = app;
