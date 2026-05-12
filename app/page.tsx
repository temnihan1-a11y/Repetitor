import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/50">
        <h1 className="text-4xl font-semibold">Math Tutor</h1>
        <p className="mt-4 text-slate-600">Добро пожаловать! Войдите или перейдите на доску для занятий.</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Link href="/auth/signin" className="inline-flex justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
            Sign In
          </Link>
          <Link href="/board" className="inline-flex justify-center rounded-xl border border-slate-900 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
            Go to Whiteboard
          </Link>
        </div>
      </div>
    </main>
  );
}
