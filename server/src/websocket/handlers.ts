import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function setupWebsockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    // We can handle authentication via socket.handshake.auth.token if needed
    // For now, allow open connection to public channels like 'contests'

    socket.on('join_user_room', (userId: string) => {
      // Basic room joining for user-specific events
      socket.join(`user:${userId}`);
      console.log(`Socket ${socket.id} joined room user:${userId}`);
    });

    socket.on('leave_user_room', (userId: string) => {
      socket.leave(`user:${userId}`);
    });
  });

  // We can also set up Prisma middleware or pulse extensions to emit events automatically,
  // but for a simple approach, services will import `io` and call `io.emit` directly.
}
