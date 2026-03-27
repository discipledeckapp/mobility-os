import type { NextPageContext } from 'next';

type ErrorPageProps = {
  statusCode?: number;
};

export default function CustomErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_100%)] px-4 py-10">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-10 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--mobiris-primary-dark)]">
          Control plane
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {statusCode === 404 ? 'Page not found' : 'Control plane error'}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {statusCode === 404
            ? 'The platform surface you requested does not exist or is no longer available.'
            : 'The platform console hit an unexpected error while rendering this page.'}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center justify-center rounded-[var(--mobiris-radius-button)] bg-[var(--mobiris-primary)] px-5 text-sm font-medium text-white"
            href="/"
          >
            Go to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}

CustomErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};
