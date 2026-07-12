/**
 * Employee Management System — Backend Server
 * =============================================
 * 
 * This is the main entry point for the Node.js/Express backend.
 * It connects to MongoDB, sets up middleware, and mounts the
 * employee REST API routes.
 * 
 * Environment Variables:
 *   MONGO_URI  — MongoDB connection string (default: mongodb://mongodb:27017/employeedb)
 *   PORT       — Server port (default: 5000)
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import the employee routes
const employeeRoutes = require('./routes/employees');

// ============================================================
// App Initialization
// ============================================================

const app = express();

// Port the server listens on (inside the Docker container)
const PORT = process.env.PORT || 5000;

// MongoDB connection string
// "mongodb" is the service name defined in docker-compose.yml,
// Docker's internal DNS resolves it to the MongoDB container's IP.
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/employeedb';


// ============================================================
// Middleware
// ============================================================

// Enable CORS so the frontend can call the backend API
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url}`);
  next();
});


// ============================================================
// Routes
// ============================================================

// Health check endpoint — useful for Docker and Jenkins verification
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Employee Management API is running!',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Mount the employee CRUD routes under /api/employees
app.use('/api/employees', employeeRoutes);

// Catch-all for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
});


// ============================================================
// MongoDB Connection & Server Start
// ============================================================

// Connect to MongoDB with retry logic.
// On first launch, MongoDB might still be starting up, so we
// retry a few times before giving up.

const connectWithRetry = (retries = 10, delay = 3000) => {
  console.log(`🔌 Attempting to connect to MongoDB at: ${MONGO_URI}`);

  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('✅ Successfully connected to MongoDB');

      // Start listening for HTTP requests only after DB is ready
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Backend server is running on port ${PORT}`);
        console.log(`📋 API Endpoints:`);
        console.log(`   GET    /api/health`);
        console.log(`   GET    /api/employees`);
        console.log(`   POST   /api/employees`);
        console.log(`   PUT    /api/employees/:id`);
        console.log(`   DELETE /api/employees/:id`);
      });
    })
    .catch((err) => {
      console.error(`❌ MongoDB connection failed: ${err.message}`);

      if (retries > 0) {
        console.log(`🔄 Retrying in ${delay / 1000} seconds... (${retries} retries left)`);
        setTimeout(() => connectWithRetry(retries - 1, delay), delay);
      } else {
        console.error('💀 Could not connect to MongoDB after multiple retries. Exiting.');
        process.exit(1);
      }
    });
};

// Begin the connection process
connectWithRetry();
