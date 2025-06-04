import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db/mongoose.js';
import { handleProxyRequest } from './routes/proxy.js';
import analyticsRouter from './routes/analytics.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post('/api/proxy', handleProxyRequest);
app.use('/api/analytics', analyticsRouter);
app.use('/api/auth', userRoutes);
app.use('/api/projects', projectRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});


// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 