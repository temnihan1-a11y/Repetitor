# Инструкция по развёртыванию на Vercel

## Шаг 1: Инициализируем Git репозиторий

```bash
cd D:\Mathematics
git init
git add .
git commit -m "Initial commit: Math Tutor Whiteboard"
```

## Шаг 2: Загружаем на GitHub

1. Откройте https://github.com/new
2. Создайте репозиторий с именем `math-tutor-whiteboard`
3. Скопируйте команды:

```bash
git remote add origin https://github.com/YOUR_USERNAME/math-tutor-whiteboard.git
git branch -M main
git push -u origin main
```

Замените `YOUR_USERNAME` на ваше имя пользователя GitHub.

## Шаг 3: Развертиваем на Vercel

### Вариант 1: Через веб-интерфейс Vercel (проще)

1. Откройте https://vercel.com
2. Нажмите **Sign Up** и выберите **Continue with GitHub**
3. После авторизации нажмите **New Project**
4. Выберите репозиторий `math-tutor-whiteboard`
5. Vercel автоматически обнаружит Next.js
6. Нажмите **Deploy**
7. Дождитесь завершения (обычно 1-2 минуты)
8. Копируйте готовую ссылку: `https://your-app.vercel.app`

### Вариант 2: Через Vercel CLI (для продвинутых)

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Шаг 4: Дайте ссылку ученикам

Пример ссылки на доску:
```
https://your-math-site.vercel.app/board
```

Ученики открывают ссылку и сразу видят доску. Все пишут одновременно!

## Переменные окружения на Vercel

Vercel автоматически подхватывает переменные из `.env.local`. Если нужно переопределить:

1. В панели Vercel откройте **Settings** → **Environment Variables**
2. Добавьте:
   - `NEXTAUTH_SECRET=your-secret-key`
   - `NEXTAUTH_URL=https://your-app.vercel.app`

## Важно: Синхронизация доски

⚠️ **Текущее ограничение**: Рисунки сохраняются только в памяти сервера.

Если сервер перезагрузится (обновление кода):
- Рисунки будут очищены
- Ученики, подключённые во время перезагрузки, переподключатся автоматически

**Для постоянного сохранения** нужна база данных (MongoDB, PostgreSQL и т.д.).

## Как обновить приложение

1. Отредактируйте файлы локально
2. Закоммитьте изменения:
   ```bash
   git add .
   git commit -m "Описание изменений"
   git push origin main
   ```
3. Vercel автоматически переразвернёт приложение

## Доступ учеников

Учеников не нужно регистрировать. Они просто открывают `/board`:

```
https://your-app.vercel.app/board
```

Если хотите ограничить доступ только авторизованным пользователям, отредактируйте `app/board/page.tsx` и добавьте проверку сессии.

## Контакты поддержки

- Vercel документация: https://vercel.com/docs
- Next.js документация: https://nextjs.org/docs
- Socket.io документация: https://socket.io/docs/