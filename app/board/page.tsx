'use client';

import { useRef, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function BoardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [users, setUsers] = useState(1);

  useEffect(() => {
    // Инициализируем canvas
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 60;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    resizeCanvas();
    setContext(ctx);

    window.addEventListener('resize', resizeCanvas);

    // Инициализируем WebSocket
    const socket = io('/', {
      path: '/api/socket',
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Подключились к серверу');
      setUsers((prev) => prev + 1);
    });

    // Загружаем сохранённое состояние доски
    socket.on('load-board', (drawing) => {
      if (drawing && drawing.length > 0) {
        drawing.forEach((stroke: any) => {
          redrawStroke(ctx, stroke);
        });
      }
    });

    // Получаем рисование от других пользователей
    socket.on('draw', (data) => {
      redrawStroke(ctx, data);
    });

    // Получаем событие очистки доски
    socket.on('clear-board', () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    socket.on('disconnect', () => {
      setUsers((prev) => Math.max(1, prev - 1));
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      socket.disconnect();
    };
  }, []);

  const redrawStroke = (ctx: CanvasRenderingContext2D, stroke: any) => {
    ctx.strokeStyle = stroke.color || '#111827';
    ctx.lineWidth = stroke.width || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (stroke.type === 'begin') {
      ctx.beginPath();
      ctx.moveTo(stroke.x, stroke.y);
    } else if (stroke.type === 'draw') {
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
    } else if (stroke.type === 'end') {
      ctx.closePath();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || !canvasRef.current) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);

    socketRef.current?.emit('draw', { type: 'begin', x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();

    socketRef.current?.emit('draw', { type: 'draw', x, y });
  };

  const stopDrawing = () => {
    if (!context) return;
    setIsDrawing(false);
    context.closePath();
    socketRef.current?.emit('draw', { type: 'end' });
  };

  const clearCanvas = () => {
    if (!context || !canvasRef.current) return;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socketRef.current?.emit('clear-board');
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold">Whiteboard -1</h1>
          <p className="text-xs text-slate-600">
            {users} {users === 1 ? 'пользователь' : 'пользователей'} онлайн
          </p>
        </div>
        <button
          onClick={clearCanvas}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Clear
        </button>
      </header>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="flex-1 cursor-crosshair bg-white touch-none"
        style={{ touchAction: 'none' }}
      />
    </main>
  );
}
