// You can use this just for structure OR integrate with a validator like zod or Joi

const VisitorEvent = {
    type: "pageview" | "click" | "session_end",// or "click" | "session_end"
    page: "",
    sessionId: "",
    timestamp: "",
    country: "",
    metadata: {
        device: "",
        referrer: ""
    }
};

const Session = {
    sessionId: "",
    journey: [],
    currentPage: "",
    startTime: new Date(),
    lastActivity: new Date(),
    country: "",
    metadata: {}
};

const AnalyticsSummary = {
    totalActive: 0,
    totalToday: 0,
    pagesVisited: {},
    activeSessions: []
};

module.exports = {
    VisitorEvent,
    Session,
    AnalyticsSummary
};
