import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import productRoutes from './routes/productRoutes';
import healthRoutes from './routes/healthRoutes';
import uploadRoutes from './routes/uploadRoutes';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

// Set Server Timezone
const timezone = 'Africa/Lagos';
process.env.TZ = timezone;

const app = express();
const PORT = process.env.PORT || 5001;

// Rate Limiter Configuration
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: 'Too many requests from this IP, please try again after 5 minutes',
});

// CORS Configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization,x-api-key',
  credentials: false,
};

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());

// Serve uploaded static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);



// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Oyster E-Commerce & Admin Platform Express TypeScript Prisma API',
    timezone: process.env.TZ,
    health: '/api/health',
  });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Oyster Backend API server running on http://localhost:${PORT}`);
  console.log(`🌍 Timezone set to: ${process.env.TZ}`);
  console.log(`⚡ Powered by Express + TypeScript + Prisma ORM + Neon PostgreSQL`);
});

export default app;
