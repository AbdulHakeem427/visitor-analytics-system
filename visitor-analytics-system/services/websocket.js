const { Server } = require('socket.io');
const DataStore = require('./datastore');

class WebSocketService {
    constructor(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.dataStore = new DataStore();
        this.setupEventHandlers();
        
        console.log('🔌 WebSocket server initialized');
    }

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`📱 Dashboard connected: ${socket.id}`);
            
            const totalDashboards = this.dataStore.incrementDashboards();
            
            this.io.emit('user_connected', {
                type: 'user_connected',
                data: {
                    totalDashboards,
                    connectedAt: new Date().toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                    })
                }
            });
            
            socket.emit('visitor_update', {
                type: 'visitor_update',
                data: {
                    event: null,
                    stats: this.dataStore.getSummary()
                }
            });

            socket.on('request_detailed_stats', (data) => {
                console.log('📊 Detailed stats requested:', data);
                const filteredData = this.dataStore.getFilteredData(data.filter);
                socket.emit('detailed_stats', {
                    type: 'detailed_stats',
                    data: filteredData
                });
            });

            socket.on('track_dashboard_action', (data) => {
                console.log('🎯 Dashboard action tracked:', data);
                socket.broadcast.emit('dashboard_action', {
                    type: 'dashboard_action',
                    data: {
                        socketId: socket.id,
                        action: data.action,
                        details: data.details,
                        timestamp: new Date().toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        })
                    }
                });
            });

            socket.on('disconnect', () => {
                console.log(`📱 Dashboard disconnected: ${socket.id}`);
                const totalDashboards = this.dataStore.decrementDashboards();
                socket.broadcast.emit('user_disconnected', {
                    type: 'user_disconnected',
                    data: {
                        totalDashboards
                    }
                });
            });
        });
    }

    broadcastVisitorUpdate(event) {
        const stats = this.dataStore.getSummary();
        this.io.emit('visitor_update', {
            type: 'visitor_update',
            data: {
                event,
                stats
            }
        });
        this.checkForAlerts(stats);
        console.log(`📊 Broadcasted visitor update to ${this.dataStore.getDashboardCount()} dashboards`);
    }

    broadcastSessionActivity(sessionId) {
        const activeSessions = this.dataStore.getActiveSessions();
        const session = activeSessions.find(s => s.sessionId === sessionId);

        if (session) {
            const now = new Date();
            const durationInSeconds = Math.max(0, Math.floor((now - session.startTime) / 1000));
            this.io.emit('session_activity', {
                type: 'session_activity',
                data: {
                    sessionId: session.sessionId,
                    currentPage: session.currentPage,
                    journey: session.journey,
                    duration: durationInSeconds
                }
            });
        }
    }

    checkForAlerts(stats) {
        console.log("✅ checkForAlerts called with stats:", stats);

        if (stats.totalActive > 10) {
            console.log("🚨 Emitting milestone alert");
            this.io.emit('alert', {
                type: 'alert',
                data: {
                    level: 'milestone',
                    message: 'High visitor activity detected!',
                    details: { activeVisitors: stats.totalActive }
                }
            });
        }

        if (stats.totalActive > 5) {
            console.log("🚨 Emitting info alert");
            this.io.emit('alert', {
                type: 'alert',
                data: {
                    level: 'info',
                    message: 'New visitor spike detected!',
                    details: { visitorsLastMinute: stats.totalActive }
                }
            });
        }
    }

    addEvent(event) {
        const processedEvent = this.dataStore.addEvent(event);
        this.broadcastVisitorUpdate(processedEvent);
        this.broadcastSessionActivity(event.sessionId);
        return processedEvent;
    }

    getSummary() {
        return this.dataStore.getSummary();
    }

    getSessions() {
        return this.dataStore.getActiveSessions();
    }

    getFilteredData(filter) {
        return this.dataStore.getFilteredData(filter);
    }
}

module.exports = WebSocketService;
