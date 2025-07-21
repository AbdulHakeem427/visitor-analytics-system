const e = require("express");

class DataStore {
    constructor() {
        this.sessions = new Map(); // sessionId -> Session
        this.events = []; // All events
        this.todayEvents = []; // Today's events
        this.pagesVisited = new Map(); // page -> count
        this.connectedDashboards = 0;
        
        // Clean up old data periodically
        setInterval(() => this.cleanup(), 60000); // Every minute
    }

    addEvent(event) {
        // Add to events array
        this.events.push(event);
        
        // Add to today's events
        const today = new Date().toDateString();
        const eventDate = new Date(event.timestamp).toDateString();
        
        if (eventDate === today) {
            this.todayEvents.push(event);
        }
        
        // Update page visit count
        const currentCount = this.pagesVisited.get(event.page) || 0;
        this.pagesVisited.set(event.page, currentCount + 1);
        
        // Update session
        this.updateSession(event);
        
        return event;
    }

    updateSession(event) {
       
        let session = this.sessions.get(event.sessionId);
        //const safeTimestamp = isNaN(new Date(event.timestamp)) ? new Date() : new Date(event.timestamp);
        
        if (!session) {
            session = {
                sessionId: event.sessionId + '-' + Date.now(),
                journey: [],
                currentPage: event.page,
                startTime:new Date(event.timestamp),
                lastActivity: new Date(event.timestamp),
                country: event.country,
                active: true,
                metadata: event.metadata || {}
            };
            this.sessions.set(event.sessionId, session);
        }

        session.lastActivity =new Date(event.timestamp),
        session.currentPage = event.page;

        if (!session.journey.includes(event.page)) {
            session.journey.push(event.page);
        }

        if (event.type === 'session_end') {
            session.active = false;
        }

        return session;
    }
    
getActiveSessions() {
    const now = new Date();
    const activeThreshold = 5 * 60 * 1000; // 5 minutes

    const activeSessions = [];

    for (const [sessionId, session] of this.sessions.entries()) {
        if (!session.lastActivity || !session.startTime) continue;

        const timeSinceLastActivity = now - new Date(session.lastActivity);

        if (timeSinceLastActivity < activeThreshold && session.active !== false) {
           // const duration = Math.max(0, Math.floor((now - new Date(session.startTime)) / 1000));
            activeSessions.push({
                ...session,
                duration:Math.floor((now - session.startTime) / 1000)
            });
        }
    }

    return activeSessions;
}

        formatDuration(seconds) {
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;

            if (hrs > 0) {
                return `${hrs}h ${mins}m ${secs}s`;
            } else {
                return `${mins}m ${secs}s`;
            }
        }
    getSummary() {
        const activeSessions = this.getActiveSessions();
        
        return {
            totalActive: activeSessions.length,
            totalToday: this.todayEvents.length,
            pagesVisited: Object.fromEntries(this.pagesVisited),
            activeSessions: activeSessions,
            connectedDashboards: this.connectedDashboards 
        };
    }

    getFilteredData(filter = {}) {
        let filteredEvents = [...this.events];
        let filteredSessions = this.getActiveSessions();
        
        if (filter.country) {
            filteredEvents = filteredEvents.filter(event => 
                event.country === filter.country
            );
            filteredSessions = filteredSessions.filter(session => 
                session.country === filter.country
            );
        }
        
        if (filter.page) {
            filteredEvents = filteredEvents.filter(event => 
                event.page === filter.page
            );
            filteredSessions = filteredSessions.filter(session => 
                session.journey.includes(filter.page)
            );
        }
        
        return {
            events: filteredEvents,
            sessions: filteredSessions,
            summary: {
                totalActive: filteredSessions.length,
                totalToday: filteredEvents.filter(event => {
                    const today = new Date().toDateString();
                    const eventDate = new Date(event.timestamp).toDateString();
                    return eventDate === today;
                }).length
            }
        };
    }

    cleanup() {
        // Remove old events (keep last 1000)
        if (this.events.length > 1000) {
            this.events = this.events.slice(-1000);
        }
        
        // Remove inactive sessions older than 1 hour
        const now = new Date();
        const inactiveThreshold = 60 * 60 * 1000; // 1 hour
        
        for (const [sessionId, session] of this.sessions.entries()) {
            const timeSinceLastActivity = now - session.lastActivity;
            if (timeSinceLastActivity > inactiveThreshold) {
                this.sessions.delete(sessionId);
            }
        }
        // Clean today's events at midnight
        const today = new Date().toDateString();
        this.todayEvents = this.todayEvents.filter(event => {
            const eventDate = new Date(event.timestamp).toDateString();
            return eventDate === today;
        });
    }

    incrementDashboards() {
        this.connectedDashboards++;
        return this.connectedDashboards;
    }

    decrementDashboards() {
        this.connectedDashboards = Math.max(0, this.connectedDashboards - 1);
        return this.connectedDashboards;
    }

    getDashboardCount() {
        return this.connectedDashboards;
    }
}

module.exports = DataStore;

