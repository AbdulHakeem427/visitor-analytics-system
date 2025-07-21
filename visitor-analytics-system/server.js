const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');

const WebSocketService = require('./services/websocket');
const analyticsRoutes = require('./routes/analytics');
const eventsRoutes = require('./routes/events'); 

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Make WebSocket service available to routes
app.locals.wsService = wsService;

// Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api', eventsRoutes); // Mounts /api/events

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
});

module.exports = { app, server, wsService };