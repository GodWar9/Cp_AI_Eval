import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import contestRoutes from './routes/contests';
import leaderboardRoutes from './routes/leaderboard';
import chatRoutes from './routes/chat';
import { errorHandler } from './middleware/errorHandler';
import { startScheduler } from './pollers/scheduler';
import { setupWebsockets } from './websocket/handlers';

dotenv.config({ path: '../.env' }); // Load from root

const app = express();
const server = http.createServer(app);

// Configure Socket.IO
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:9002',
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO handlers
setupWebsockets(io);

// Start background pollers
startScheduler();

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
