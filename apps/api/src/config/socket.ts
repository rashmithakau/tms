import { Server } from 'socket.io';
import http from 'http';
import { APP_ORIGIN, NODE_ENV } from '../constants/env';

type UserId = string;

class SocketService {
  private io?: Server;
  private userIdToSocketIds: Map<UserId, Set<string>> = new Map();

  init(server: http.Server) {
    this.io = new Server(server, {
      cors: {
        origin: APP_ORIGIN,
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      const userId = (socket.handshake.query.userId as string) || '';
      if (userId) {
        if (!this.userIdToSocketIds.has(userId)) this.userIdToSocketIds.set(userId, new Set());
        this.userIdToSocketIds.get(userId)!.add(socket.id);
      }

      socket.on('disconnect', () => {
        if (userId && this.userIdToSocketIds.has(userId)) {
          this.userIdToSocketIds.get(userId)!.delete(socket.id);
          if (this.userIdToSocketIds.get(userId)!.size === 0) this.userIdToSocketIds.delete(userId);
        }
      });
    });
  }

  emitToUser(userId: string, event: string, payload: any) {
    if (!this.io) return;
    const socketIds = this.userIdToSocketIds.get(userId);
    if (!socketIds) return;
    socketIds.forEach((sid) => this.io!.to(sid).emit(event, payload));
  }
}

export const socketService = new SocketService();
