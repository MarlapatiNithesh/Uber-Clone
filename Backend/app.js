const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const connectToDb = require('./db/db.js');
const userRoutes = require('./routes/user.routes.js');
const captainRoutes = require('./routes/captain.routes.js');
const mapRoutes = require('./routes/map.routes.js');
const rideRoutes = require('./routes/ride.routes.js');
const { initializeSocket } = require('./socket.js');

const app = express();
connectToDb();

// ✅ ALLOWED ORIGINS
const allowedOrigins = [
  'http://localhost:5173',
];

// ✅ CORS Setup
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ✅ Middleware Headers (extra safety for preflight requests)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  next();
});

// ✅ Core Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Routes
app.get('/', (req, res) => {
  res.send('Hello world!');
});
app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/maps', mapRoutes);
app.use('/rides', rideRoutes);

// ✅ Start Server with WebSocket
const PORT = process.env.PORT || 8080;
const server = http.createServer(app);
initializeSocket(server); // 🧠 this is critical to start Socket.io!

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
