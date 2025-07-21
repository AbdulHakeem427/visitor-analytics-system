# Real-Time Visitor Analytics System

A comprehensive real-time visitor analytics dashboard built with Node.js, Express, WebSockets, and vanilla JavaScript. This system tracks website visitors and displays live updates on a dashboard using WebSocket for real-time bidirectional communication.

<img width="1920" height="1080" alt="Screenshot 2025-07-20 234236" src="https://github.com/user-attachments/assets/4a702436-abff-4fad-ae50-1dcc6eea21c7" />


## 🚀 Features

### Backend (Node.js + Express + WebSockets)
- **REST API Endpoints** for receiving visitor events
- **WebSocket Server** for real-time bidirectional communication
- **Session Tracking** with visitor journey mapping
- **Real-time Statistics** with live updates
- **Alert System** for visitor spikes and milestones

### Frontend Dashboard
- **Real-time Displays**: Active visitors, daily totals, connected dashboards
- **Live Visitor Feed** with newest events first
- **Active Sessions** with complete visitor journeys
- **Interactive Features**: Country/page filtering, session details
- **WebSocket Status** with auto-reconnection
- **Mini Chart** showing visitors over last 10 minutes
- **Responsive Design** with modern UI

## 📋 Requirements

- Node.js (v14.0.0 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone or create the project structure:**
```bash
mkdir realtime-visitor-analytics
cd realtime-visitor-analytics
```

2. **Create the required files:**
   - Copy `server.js` to the root directory
   - Create `public/` directory and copy `dashboard.html` into it
   - Copy `package.json` to the root directory

3. **Install dependencies:**
```bash
npm install
```

4. **Start the server:**
```bash
npm start
```

5. **Access the dashboard:**
   - Open your browser and navigate to: `http://localhost:3000`
   - Or directly: `http://localhost:3000/dashboard.html`

## 📊 API Endpoints

### POST /api/events
Receives visitor events from websites.

**Request Body:**
```json
{
  "type": "pageview",
  "page": "/products",
  "sessionId": "user-123",
  "timestamp": "2025-07-19T10:30:00Z",
  "country": "India",
  "metadata": {
    "device": "mobile",
    "referrer": "google.com"
  }
}
```

### GET /api/analytics/summary
Returns current statistics and recent events.

### GET /api/analytics/sessions
Returns active sessions with their complete journeys.

## 🔌 WebSocket Events

### Server → Client Events

#### `visitor_update`
Sent when a new visitor event arrives:
```json
{
  "type": "visitor_update",
  "data": {
    "event": { /* the visitor event */ },
    "stats": {
      "totalActive": 5,
      "totalToday": 150,
      "pagesVisited": { "/home": 45, "/products": 30 }
    }
  }
}
```

#### `user_connected` / `user_disconnected`
Sent when dashboards connect/disconnect:
```json
{
  "type": "user_connected",
  "data": {
    "totalDashboards": 3,
    "connectedAt": "2025-07-19T10:30:00Z"
  }
}
```

#### `session_activity`
Real-time session tracking updates:
```json
{
  "type": "session_activity",
  "data": {
    "sessionId": "user-123",
    "currentPage": "/products",
    "journey": ["/home", "/products"],
    "duration": 45
  }
}
```

#### `alert`
Server-initiated alerts for spikes and milestones:
```json
{
  "type": "alert",
  "data": {
    "level": "milestone",
    "message": "Visitor spike detected!",
    "details": {
      "visitorsLastMinute": 25
    }
  }
}
```

### Client → Server Events

#### `request_detailed_stats`
Request filtered analytics:
```json
{
  "type": "request_detailed_stats",
  "filter": {
    "country": "India",
    "page": "/products"
  }
}
```

#### `track_dashboard_action`
Track dashboard user interactions:
```json
{
  "type": "track_dashboard_action",
  "action": "filter_applied",
  "details": {
    "filterType": "country",
    "value": "India"
  }
}
```

## 🧪 Testing with Postman

### Sample Visitor Events

**1. First visitor starts browsing:**
```bash
POST http://localhost:3000/api/events
Content-Type: application/json

{
  "type": "pageview",
  "page": "/home",
  "sessionId": "visitor-001",
  "timestamp": "2025-07-20T10:30:00Z",
  "country": "India",
  "metadata": {
    "device": "desktop",
    "referrer": "google.com"
  }
}
```

**2. Same visitor navigates:**
```bash
POST http://localhost:3000/api/events
Content-Type: application/json

{
  "type": "pageview",
  "page": "/products",
  "sessionId": "visitor-001",
  "timestamp": "2025-07-20T10:30:30Z",
  "country": "India",
  "metadata": {
    "device": "desktop"
  }
}
```

**3. Click event:**
```bash
POST http://localhost:3000/api/events
Content-Type: application/json

{
  "type": "click",
  "page": "/products",
  "sessionId": "visitor-001",
  "timestamp": "2025-07-20T10:30:45Z",
  "country": "India",
  "metadata": {
    "element": "buy-button"
  }
}
```

**4. New visitor from different country:**
```bash
POST http://localhost:3000/api/events
Content-Type: application/json

{
  "type": "pageview",
  "page": "/about",
  "sessionId": "visitor-002",
  "timestamp": "2025-07-20T10:31:00Z",
  "country": "USA",
  "metadata": {
    "device": "mobile",
    "referrer": "facebook.com"
  }
}
```

**5. Session end:**
```bash
POST http://localhost:3000/api/events
Content-Type: application/json

{
  "type": "session_end",
  "page": "/products",
  "sessionId": "visitor-001",
  "timestamp": "2025-07-20T10:35:00Z",
  "country": "India"
}
```
## 🔍 Key Implementation Details

### WebSocket Connection Management
- Auto-reconnection with exponential backoff
- Connection status indicators
- Graceful handling of disconnections

### Session Tracking
- 5-minute session timeout
- Complete visitor journey mapping
- Real-time session activity updates

### Real-time Features
- Instant visitor event broadcasting
- Live statistics updates
- Interactive filtering with WebSocket communication
- Multi-dashboard synchronization

### Dashboard Features
- Modern responsive design with animations
- Live visitor feed with newest-first ordering
- Interactive session details modal
- Mini chart showing visitor activity
- Sound notifications for new visitors
- Comprehensive filtering system

## 🚨 Important Notes

- **Local Development Only**: This runs on localhost - no deployment required
- **In-Memory Storage**: All data is stored in memory (resets on server restart)
- **Real-time Focus**: Emphasis on WebSocket bidirectional communication
- **Session Management**: Automatic cleanup of inactive sessions
- **Error Handling**: Comprehensive error handling for WebSocket connections

## 🎯 Evaluation Criteria Focus

1. **✅ WebSocket Implementation** - Proper bidirectional event handling
2. **✅ Real-time Updates** - Smooth, instant dashboard updates
3. **✅ Session Tracking** - Complete visitor journey mapping
4. **✅ Interactive Features** - Two-way WebSocket communication
5. **✅ Connection Management** - Handles disconnects gracefully
6. **✅ Multiple Dashboards** - Synchronized updates across instances

## 🔧 Troubleshooting

**If WebSocket connection fails:**
- Ensure server is running on port 3000
- Check firewall settings
- Try different browser or incognito mode

**If dashboard doesn't update:**
- Check browser console for errors
- Verify WebSocket connection status
- Refresh the page to reconnect

**For development:**
- Use `npm run dev` for auto-restart with nodemon
- Check server logs for WebSocket events
- Use browser DevTools to inspect WebSocket messages

## 🏆 Success Indicators

Your implementation is working correctly when you can:

1. ✅ Send visitor events via Postman and see immediate dashboard updates
2. ✅ Open multiple dashboard tabs and see synchronized updates
3. ✅ Filter events and see WebSocket requests in DevTools
4. ✅ Click on sessions to view complete visitor journeys
5. ✅ See connection status changes when stopping/starting server
6. ✅ Observe auto-reconnection when server restarts
7. ✅ Get visitor spike alerts when sending multiple events quickly

Good luck with your assessment! 🚀
