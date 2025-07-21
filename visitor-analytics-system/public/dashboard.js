class VisitorAnalyticsDashboard {
    constructor() {
        this.socket = null;
        this.chart = null;
        this.visitorsData = [];
        this.timeLabels = [];
        this.maxDataPoints = 10;
        
        this.initializeSocket();
        this.initializeChart();
        this.setupEventListeners();
        this.setupModal();
       
        
        console.log('📊 Dashboard initialized');
    }

    initializeSocket() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('🔌 Connected to server');
            this.updateConnectionStatus('connected');
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from server');
            this.updateConnectionStatus('disconnected');
        });

        this.socket.on('reconnecting', () => {
            console.log('🔄 Reconnecting...');
            this.updateConnectionStatus('reconnecting');
        });

        // Handle visitor updates
        this.socket.on('visitor_update', (data) => {
            console.log('👤 Visitor update:', data);
            this.handleVisitorUpdate(data.data);
        });

        // Handle user connections
        this.socket.on('user_connected', (data) => {
            console.log('📱 User connected:', data);
            this.updateDashboardCount(data.data.totalDashboards);
        });

        // Handle user disconnections
        this.socket.on('user_disconnected', (data) => {
            console.log('📱 User disconnected:', data);
            this.updateDashboardCount(data.data.totalDashboards);
        });

        // Handle session activity
        this.socket.on('session_activity', (data) => {
            console.log('🎯 Session activity:', data);
            this.updateSessionActivity(data.data);
        });

        // Handle alerts
        this.socket.on('alert', (data) => {
            
           this.showAlert = this.showAlert.bind(this);
           console.log('🚨 Alert:', data);
        });

        // Handle detailed stats response
        this.socket.on('request_detailed_stats', (data) => {
            console.log('📊 Detailed stats:', data);
            this.handleDetailedStats(data.data);
        });
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
    initializeChart() {
    const canvas = document.getElementById('visitorsChart');
    const ctx = canvas.getContext('2d');
    
    // Ensure canvas has proper dimensions
    canvas.width = 400;
    canvas.height = 200;
    
    // Initialize with empty data
    for (let i = 0; i < this.maxDataPoints; i++) {
        this.visitorsData.push(0);
        this.timeLabels.push('');
    }
    
    this.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: this.timeLabels,
            datasets: [{
                label: 'Active Visitors',
                data: this.visitorsData,
                borderColor: '#4CAF50',
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: false,  // Changed from true
            maintainAspectRatio: true,  // Changed from false
            width: 400,  // Explicit width
            height: 200, // Explicit height
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

    setupEventListeners() {
        // Filter listeners
        document.getElementById('countryFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        document.getElementById('pageFilter').addEventListener('change', () => {
            this.applyFilters();
        });

        // Clear stats button
        document.getElementById('clearStats').addEventListener('click', () => {
            this.clearStats();
        });
    }

    setupModal() {
        const modal = document.getElementById('sessionModal');
        const closeBtn = modal.querySelector('.close');

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        statusElement.className = `status ${status}`;
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    }

    updateDashboardCount(count) {
        document.getElementById('dashboardCount').textContent = 
            `${count} dashboard${count !== 1 ? 's' : ''} connected`;
    }

    handleVisitorUpdate(data) {
        const { event, stats } = data;
        
        // Update stats
        this.updateStats(stats);
        
        // Add to visitor feed if there's a new event
        if (event) {
            this.addToVisitorFeed(event);
            this.updateFilters(event);
        }
        
        // Update chart
        this.updateChart(stats.totalActive);
        
        // Update sessions
        this.updateSessions(stats.activeSessions);
        
        // Update top pages
        this.updateTopPages(stats.pagesVisited);
    }

    updateStats(stats) {
        document.getElementById('activeVisitors').textContent = stats.totalActive;
        document.getElementById('todayVisitors').textContent = stats.totalToday;
        document.getElementById('pagesCount').textContent = Object.keys(stats.pagesVisited).length;
        document.getElementById('activeSessions').textContent = stats.activeSessions.length;
    }

    addToVisitorFeed(event) {
        const feed = document.getElementById('visitorFeed');
        const eventElement = document.createElement('div');
        eventElement.className = 'visitor-event';
        
        const timeString = new Date(event.timestamp).toLocaleTimeString();
        
        eventElement.innerHTML = `
            <div class="event-header">
                <span class="event-type ${event.type}">${event.type}</span>
                <span class="event-time">${timeString}</span>
            </div>
            <div class="event-details">
                <span class="session-id">${event.sessionId}</span>
                <span class="page">${event.page}</span>
                <span class="country">${event.country}</span>
            </div>
        `;
        
        feed.insertBefore(eventElement, feed.firstChild);
        
        // Keep only latest 20 events
        while (feed.children.length > 20) {
            feed.removeChild(feed.lastChild);
        }
        
        // Add animation
        eventElement.classList.add('new-event');
        setTimeout(() => {
            eventElement.classList.remove('new-event');
        }, 1000);
    }

    updateChart(activeVisitors) {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Shift data
        this.visitorsData.shift();
        this.timeLabels.shift();
        
        // Add new data
        this.visitorsData.push(activeVisitors);
        this.timeLabels.push(timeString);
        
        this.chart.update('none');
    }

    updateSessions(sessions) {
        const sessionsList = document.getElementById('sessionsList');
        sessionsList.innerHTML = '';
        sessions.forEach(session => {
            const rawSeconds = session.duration;
        const formattedDuration = this.formatDuration(rawSeconds); // Add duration to session object
            const sessionElement = document.createElement('div');
            sessionElement.className = 'session-item';
            sessionElement.innerHTML = `
                <div class="session-header">
                    <span class="session-id">${session.sessionId}</span>
                    <span class="session-duration">${formattedDuration}</span>
                </div>
                <div class="session-details">
                    <span class="current-page">📍 ${session.currentPage}</span>
                    <span class="country">🌍 ${session.country}</span>
                    <span class="pages-count">${session.journey.length} pages</span>
                </div>
            `;
            
            // Add click listener to show journey
            sessionElement.addEventListener('click', () => {
                this.showSessionJourney(session);
            });
            
            sessionsList.appendChild(sessionElement);
        });
    }

    updateTopPages(pagesVisited) {
        const topPagesElement = document.getElementById('topPages');
        topPagesElement.innerHTML = '';
        
        // Sort pages by visit count
        const sortedPages = Object.entries(pagesVisited)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        sortedPages.forEach(([page, count]) => {
            const pageElement = document.createElement('div');
            pageElement.className = 'page-item';
            pageElement.innerHTML = `
                <span class="page-name">${page}</span>
                <span class="page-count">${count}</span>
            `;
            topPagesElement.appendChild(pageElement);
        });
    }

    updateFilters(event) {
        const countryFilter = document.getElementById('countryFilter');
        const pageFilter = document.getElementById('pageFilter');

        // Update country filter
        if (event.country && ![...countryFilter.options].some(o => o.value === event.country)) {
            const opt = document.createElement('option');
            opt.value = event.country;
            opt.textContent = event.country;
            countryFilter.appendChild(opt);
        }

        // Update page filter
        if (event.page && ![...pageFilter.options].some(o => o.value === event.page)) {
            const opt = document.createElement('option');
            opt.value = event.page;
            opt.textContent = event.page;
            pageFilter.appendChild(opt);
        }
    }

    applyFilters() {
        const country = document.getElementById('countryFilter').value;
        const page = document.getElementById('pageFilter').value;
        
        const filter = {};
        if (country) filter.country = country;
        if (page) filter.page = page;
        
        // Send filter request to server
        this.socket.emit('request_detailed_stats', { filter });
       
        // Track dashboard action
        this.socket.emit('track_dashboard_action', {
            action: 'filter_applied',
            details: { filter }
        });
        console.log("Country:", country);
        console.log("Page:", page);
    }

    handleDetailedStats(data) {
    console.log('📊 Filtered stats received:', data);

    this.updateStats(data.summary); // Assuming you have this method
    this.renderSessions(data.sessions || []);
    this.renderTopPages(data.events || []);
}

    showSessionJourney(session) {
        const modal = document.getElementById('sessionModal');
        const journeyElement = document.getElementById('sessionJourney');

        // Convert duration from seconds to mm:ss format

        journeyElement.innerHTML = `
            <div class="session-info">
                <h3>Session: ${session.sessionId}</h3>
                <p><strong>Country:</strong> ${session.country}</p>
                <p><strong>Duration:</strong> ${session.duration}</p>
                <p><strong>Current Page:</strong> ${session.currentPage}</p>
            </div>
            <div class="journey-steps">
                <h4>Page Journey:</h4>
                ${session.journey.map((page, index) => `
                    <div class="journey-step ${page === session.currentPage ? 'current' : ''}">
                        <span class="step-number">${index + 1}</span>
                        <span class="step-page">${page}</span>
                        ${page === session.currentPage ? '<span class="current-indicator">← Current</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;

        modal.style.display = 'block';
    }


    updateSessionActivity(data) {
        // Update specific session in the list
        const sessionElements = document.querySelectorAll('.session-item');
        sessionElements.forEach(element => {
            const sessionId = element.querySelector('.session-id').textContent;
            if (sessionId === data.sessionId) {
                element.querySelector('.session-duration').textContent = `${data.duration}s`;
                element.querySelector('.current-page').textContent = `📍 ${data.currentPage}`;
                element.querySelector('.pages-count').textContent = `${data.journey.length} pages`;
                
                // Add activity indicator
                element.classList.add('active-session');
                setTimeout(() => {
                    element.classList.remove('active-session');
                }, 2000);
            }
        });
    }

    showAlert(alertData) {
        console.log("📢 showAlert called with:", alertData); 
        const alertsContainer = document.getElementById('alertsContainer');
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert-${alertData.level}`;
        
        alertElement.innerHTML = `
            <div class="alert-content">
                <span class="alert-message">${alertData.message}</span>
                <button class="alert-close">&times;</button>
            </div>
            <div class="alert-details">${JSON.stringify(alertData.details, null, 2)}</div>
        `;
        
        // Add close functionality
        alertElement.querySelector('.alert-close').addEventListener('click', () => {
            alertElement.remove();
        });
        
        alertsContainer.appendChild(alertElement);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertElement.parentNode) {
                alertElement.remove();
            }
        }, 5000);
        
        // Play notification sound (optional)
        this.playNotificationSound();
        
    }

    playNotificationSound() {
        // Simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.log('Could not play notification sound:', error);
        }
    }

    clearStats() {
        if (confirm('Are you sure you want to clear all statistics?')) {
            // Send clear stats request
            this.socket.emit('track_dashboard_action', {
                action: 'clear_stats',
                details: { timestamp: Date.now() }
            });
            
            // Clear local display
            document.getElementById('visitorFeed').innerHTML = '';
            
            // Reset chart data
            this.visitorsData.fill(0);
            this.timeLabels.fill('');
            this.chart.update();
        }
    }
}
document.getElementById('applyFilters').addEventListener('click', () => {
    dashboard.applyFilters();
});
// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new VisitorAnalyticsDashboard();
});
