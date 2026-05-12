import type { Server as HTTPServer } from 'http';
import type { Socket as NetSocket } from 'net';
import { Server } from 'socket.io';

interface SocketServer extends HTTPServer {
  io?: Server;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

// Хранилище рисунков доски для каждой сессии
const boardSessions: Map<string, any[]> = new Map();
const defaultSessionId = 'main-board';

export const initSocket = (server: HTTPServer) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
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
      io.emit('clear-board');
    });

    socket.on('disconnect', () => {
      console.log(`Пользователь отключился: ${socket.id}`);
    });
  });

  return io;
};

export default initSocket;