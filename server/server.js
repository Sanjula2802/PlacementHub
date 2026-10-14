import express from 'express';
import cors from 'cors';
import { CONFIG } from './config.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging (sanitized)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[API] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'PlacementHub Auth & Administration API',
    time: new Date().toISOString()
  });
});

// Authentication and Authorization Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);

// Catch-all 404 for unhandled API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint '${req.originalUrl}' not found.`,
    code: 'NOT_FOUND'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: 'INTERNAL_ERROR'
  });
});

// Start listening
const server = app.listen(CONFIG.PORT, () => {
  console.log(`====================================================`);
  console.log(` PlacementHub Auth Server listening on port ${CONFIG.PORT}`);
  console.log(` - Health check: http://localhost:${CONFIG.PORT}/api/health`);
  console.log(` - Auth routes:  http://localhost:${CONFIG.PORT}/api/auth`);
  console.log(` - Admin routes: http://localhost:${CONFIG.PORT}/api/admin`);
  console.log(`====================================================`);
});

export default app;
