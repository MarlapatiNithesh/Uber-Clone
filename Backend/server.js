const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./socket'); 
const port = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;