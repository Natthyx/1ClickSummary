/**
 * Express Server
 * 
 * Purpose: Main entry point for the backend API
 * Handles CORS, routing, and error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const summarizeRouter = require('./routes/summarize');

const app = express();
const PORT = process.env.PORT || 3000;

// Validate required environment variables
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is not set in environment variables');
  console.error('Please create a .env file with your Gemini API key');
  console.error('Example: GEMINI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: '*', // For MVP - in production, restrict to specific domains
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' })); // Limit request body size

// Routes
app.use('/summarize', summarizeRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '1-Click Job Summary API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '1-Click Job Summary API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      summarize: 'POST /summarize'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: {
      health: 'GET /health',
      summarize: 'POST /summarize'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('✅ 1-Click Job Summary API is running');
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
  console.log(`🤖 Gemini API: Connected`);
  console.log('');
  console.log('Ready to process job summaries! 🚀');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
