import type { NextApiRequest, NextApiResponse } from 'next';

// Хранилище активных пользователей в памяти
interface UserSession {
  id: string;
  connectedAt: number;
}

const activeUsers: Map<string, UserSession> = new Map();
const MAX_USERS = 4;
const SESSION_TIMEOUT = 30000; // 30 секунд неактивности = разлог

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Очищаем старые сессии
  const now = Date.now();
  for (const [id, user] of activeUsers.entries()) {
    if (now - user.connectedAt > SESSION_TIMEOUT) {
      activeUsers.delete(id);
    }
  }

  if (req.method === 'POST') {
    const { action, userId } = req.body;

    if (action === 'join') {
      // Проверяем лимит
      if (activeUsers.size >= MAX_USERS) {
        // Находим самого долгого пользователя и выкидываем его
        let oldestId = '';
        let oldestTime = Infinity;

        activeUsers.forEach((user, id) => {
          if (user.connectedAt < oldestTime) {
            oldestTime = user.connectedAt;
            oldestId = id;
          }
        });

        if (oldestId) {
          activeUsers.delete(oldestId);
          return res.status(200).json({
            kicked: oldestId,
            count: activeUsers.size,
            message: 'User limit reached'
          });
        }
      }

      // Добавляем нового пользователя
      activeUsers.set(userId, {
        id: userId,
        connectedAt: now
      });

      return res.status(200).json({
        count: activeUsers.size,
        message: 'Joined'
      });
    }

    if (action === 'leave') {
      activeUsers.delete(userId);
      return res.status(200).json({
        count: activeUsers.size,
        message: 'Left'
      });
    }

    if (action === 'ping') {
      // Обновляем время последней активности
      const user = activeUsers.get(userId);
      if (user) {
        user.connectedAt = now;
      }

      return res.status(200).json({
        count: activeUsers.size
      });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      count: activeUsers.size,
      message: 'Current users'
    });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
