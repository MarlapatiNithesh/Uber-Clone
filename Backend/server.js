const http = require('http');
const { app, connectToDb } = require('./app'); // Correctly destructure
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 5000;

// Health check for Render
app.get('/', (req, res) => {
  res.status(200).send("🚀 Uber Clone backend is live");
});

// Create HTTP server (needed for WebSocket)
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Connect to MongoDB and then start server
async function startServer() {
  try {
    await connectToDb();
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Keep-alive settings (for Render)
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;

// Start it all
startServer();
