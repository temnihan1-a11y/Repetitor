import type { NextApiRequest, NextApiResponse } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { Server } from 'socket.io';

interface SocketServer extends HTTPServer {
  io?: Server;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface UserSession {
  socketId: string;
  connectedAt: number;
}

// Хранилище рисунков для каждой сессии
const boardSessions: Map<string, any[]> = new Map();
const defaultSessionId = 'main-board';

// Хранилище активных пользователей
const activeUsers: Map<string, UserSession> = new Map();
const MAX_USERS = 4;

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const socket = res.socket as SocketWithIO;
  const io = socket.server.io;

  if (!io) {
    const socketServer = socket.server as SocketServer;

    const newIO = new Server(socketServer, {
      path: '/api/socket',
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    newIO.on('connection', (socket) => {
      console.log(`Пользователь подключился: ${socket.id}`);

      // Проверяем, не превышен ли лимит
      if (activeUsers.size >= MAX_USERS) {
        // Находим пользователя с наибольшим временем подключения
        let oldestSocketId = '';
        let oldestTime = Infinity;

        activeUsers.forEach((user) => {
          if (user.connectedAt < oldestTime) {
            oldestTime = user.connectedAt;
            oldestSocketId = user.socketId;
          }
        });

        // Отправляем сообщение о закрытии сессии старому пользователю
        newIO.to(oldestSocketId).emit('session-ended');

        // Отключаем старого пользователя
        const oldSocket = newIO.sockets.sockets.get(oldestSocketId);
        if (oldSocket) {
          oldSocket.disconnect(true);
        }

        activeUsers.delete(oldestSocketId);
      }

      // Добавляем нового пользователя
      activeUsers.set(socket.id, {
        socketId: socket.id,
        connectedAt: Date.now()
      });

      // Если доска ещё не создана, создаём её
      if (!boardSessions.has(defaultSessionId)) {
        boardSessions.set(defaultSessionId, []);
      }

      // Отправляем текущее состояние доски новому пользователю
      const currentDrawing = boardSessions.get(defaultSessionId);
      socket.emit('load-board', currentDrawing);

      // Отправляем количество активных пользователей ВСЕм (включая нового)
      newIO.emit('users-count', activeUsers.size);

      // Слушаем события рисования
      socket.on('draw', (data) => {
        // Сохраняем в памяти
        currentDrawing?.push(data);

        // Отправляем всем остальным
        socket.broadcast.emit('draw', data);
      });

      // Слушаем событие очистки доски
      socket.on('clear-board', () => {
        boardSessions.set(defaultSessionId, []);
        newIO.emit('clear-board');
      });

      socket.on('disconnect', () => {
        console.log(`Пользователь отключился: ${socket.id}`);
        activeUsers.delete(socket.id);
        // Отправляем обновленное количество всем
        newIO.emit('users-count', activeUsers.size);
      });
    });

    socketServer.io = newIO;
  }

  res.end();
};

export default handler;