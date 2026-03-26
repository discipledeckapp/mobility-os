import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-4 text-center">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">404</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page not found</h1>
        <p className="text-slate-500">
          The page you are looking for does not exist or has moved.
        </p>
      </div>
      <Link
        className="rounded-[var(--mobiris-radius-card)] bg-[var(--mobiris-primary)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        href="/"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
