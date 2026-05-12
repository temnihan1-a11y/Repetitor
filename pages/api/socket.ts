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

// Хранилище рисунков для каждой сессии
const boardSessions: Map<string, any[]> = new Map();
const defaultSessionId = 'main-board';

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

      // Если доска ещё не создана, создаём её
      if (!boardSessions.has(defaultSessionId)) {
        boardSessions.set(defaultSessionId, []);
      }

      // Отправляем текущее состояние доски новому пользователю
      const currentDrawing = boardSessions.get(defaultSessionId);
      socket.emit('load-board', currentDrawing);

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
      });
    });

    socketServer.io = newIO;
  }

  res.end();
};

export default handler;