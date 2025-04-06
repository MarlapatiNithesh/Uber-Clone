const http = require('http');
const express = require('express');
const app = require('./app'); // Your main Express app
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 5000;

// Optional: Health check for Render
app.get('/', (req, res) => {
  res.status(200).send("🚀 Uber Clone backend is live");
});

// Create HTTP server (IMPORTANT for WebSocket)
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Listen on the server (NOT app.listen)
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});

// Keep-alive settings for Render hosting
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
