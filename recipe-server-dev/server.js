import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import client from 'prom-client';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';

dotenv.config();

const app = express();

// Middleware
const frontendUrl = process.env.FRONTEND_URL;
const corsOptions = {
  // If FRONTEND_URL is set, use it; otherwise allow requests from any origin (reflect origin)
  origin: frontendUrl || true,
  credentials: true,
};
app.use(cors(corsOptions));
// Ensure preflight requests (OPTIONS) are handled with the same CORS settings
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prometheus metrics registry for /metrics scraping.
const metricsRegistry = new client.Registry();
client.collectDefaultMetrics({ register: metricsRegistry });

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'AI Recipe Finder API' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ success: false, message: error.message || 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
