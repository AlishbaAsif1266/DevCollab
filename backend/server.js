import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB Database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Security Middlewares
app.use(helmet());

// CORS Configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`Socket Connected: ${socket.id}`);

  // User room registration
  socket.on('setup_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined personal socket room`);
    }
  });

  // Project workspace room joining
  socket.on('join_project', (projectId) => {
    if (projectId) {
      socket.join(`project_${projectId}`);
      console.log(`Socket ${socket.id} joined project room project_${projectId}`);
    }
  });

  socket.on('leave_project', (projectId) => {
    if (projectId) {
      socket.leave(`project_${projectId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket Disconnected: ${socket.id}`);
  });
});

// Attach Socket.IO instance to req object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'DevCollab API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);

// 404 Handler
app.use(notFound);

// Central Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`DevCollab Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
