const express = require('express');
const router = express.Router();


// GET /api/analytics/summary - Get current analytics summary
router.get('/summary', (req, res) => {
    try {
        const wsService = req.app.locals.wsService;
        const summary = wsService.getSummary();
        
        res.json({
            success: true,
            data: summary,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting summary:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// GET /api/analytics/sessions - Get active sessions
router.get('/sessions', (req, res) => {
    try {
        const wsService = req.app.locals.wsService;
        const sessions = wsService.getSessions();
        
        res.json({
            success: true,
            data: sessions,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error getting sessions:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

module.exports = router;