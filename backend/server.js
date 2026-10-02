const express = require('express');
const cors = require('cors');
const routeRoutes = require('./routes/routeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging for viva demonstration
app.use((req, res, next) => {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api', routeRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Smart City Garbage Collection Route Optimization System API',
    version: '1.0.0',
    course: 'Design and Analysis of Algorithms (DAA)',
    algorithmsSupported: ['Brute Force TSP', 'Branch and Bound TSP']
  });
});

// Root welcome message
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>Smart City Route Optimization API</title></head>
      <body style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #f8fafc;">
        <h1>Smart City Garbage Collection Route Optimization API</h1>
        <p>DAA College Project Backend is running on port ${PORT}.</p>
        <ul>
          <li><a style="color: #38bdf8;" href="/api/health">GET /api/health</a></li>
          <li><a style="color: #38bdf8;" href="/api/graph/sample">GET /api/graph/sample</a></li>
        </ul>
      </body>
    </html>
  `);
});

// Start listening
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🚀 Smart City Garbage Route Optimizer API running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}/api`);
  console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`================================================================`);
});
