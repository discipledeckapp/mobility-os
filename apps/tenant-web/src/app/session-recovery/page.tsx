export default async function SessionRecoveryPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const nextPath =
    resolvedSearchParams.next && resolvedSearchParams.next.startsWith('/')
      ? resolvedSearchParams.next
      : '/';
  const retryHref = nextPath;
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <main className="min-h-screen bg-[var(--app-background)] px-6 py-16 text-[var(--app-foreground)]">
      <div className="mx-auto flex max-w-lg flex-col gap-6 rounded-[32px] border border-[var(--app-border)] bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="space-y-3">
          <span className="inline-flex w-fit rounded-full bg-[var(--app-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--app-accent-strong)]">
            Session recovery
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-foreground)]">
            We&apos;re reconnecting your workspace
          </h1>
          <p className="text-sm leading-6 text-[var(--app-muted-foreground)]">
            Your session still exists, but we could not reconnect it right now. We&apos;ll try the
            normal app flow again instead of sending you through a separate refresh step.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-4 text-sm text-[var(--app-muted-foreground)]">
          Try your original page again. If the problem persists, log in again without losing your
          place.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={retryHref}
            className="inline-flex items-center justify-center rounded-full bg-[var(--app-foreground)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Try again
          </a>
          <a
            href={loginHref}
            className="inline-flex items-center justify-center rounded-full border border-[var(--app-border)] px-5 py-3 text-sm font-semibold text-[var(--app-foreground)] transition hover:bg-[var(--app-surface)]"
          >
            Log in again
          </a>
        </div>
      </div>
    </main>
  );
}
