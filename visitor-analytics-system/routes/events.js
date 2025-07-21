const express = require('express');
const router = express.Router();

// POST /api/events - Receive visitor events
router.post('/events', (req, res) => {
    try {
        const event = req.body;

        if (!event.type || !event.page || !event.sessionId || !event.timestamp) {
            return res.status(400).json({
                error: 'Missing required fields: type, page, sessionId, timestamp'
            });
        }

        const validTypes = ['pageview', 'click', 'session_end'];
        if (!validTypes.includes(event.type)) {
            return res.status(400).json({
                error: 'Invalid event type. Must be: pageview, click, or session_end'
            });
        }

        const wsService = req.app.locals.wsService;
        const processedEvent = wsService.addEvent(event);

        res.json({
            success: true,
            event: processedEvent,
            timestamp: new Date().toISOString()
        });

        console.log(`📥 Event received: ${event.type} - ${event.page} - ${event.sessionId}`);
    } catch (error) {
        console.error('Error processing event:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;
