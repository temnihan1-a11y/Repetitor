'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (result?.error) {
        setError('Неверный логин или пароль.');
        setLoading(false);
        return;
      }

      router.push('/board');
    } catch (err) {
      setError('Ошибка при входе.');
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-semibold">Вход</h1>
        <p className="mt-2 text-sm text-slate-600">Используйте данные admin@example.com или student@example.com.</p>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50">
            {loading ? 'Загрузка...' : 'Sign In'}
          </button>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </form>
      </div>
    </main>
  );
}
