'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#f8fafc',
          color: '#0f172a',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <main
          style={{
            width: 'min(32rem, calc(100vw - 2rem))',
            borderRadius: '1rem',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            background: 'rgba(255,255,255,0.96)',
            padding: '2rem',
            boxShadow: '0 24px 60px -32px rgba(15,23,42,0.25)',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#1d4ed8',
            }}
          >
            Control plane
          </p>
          <h1
            style={{
              margin: '0.75rem 0 0',
              fontSize: '1.75rem',
              lineHeight: 1.15,
            }}
          >
            This platform page could not load
          </h1>
          <p
            style={{
              margin: '0.9rem 0 0',
              color: '#475569',
              lineHeight: 1.6,
            }}
          >
            A server-side exception interrupted the page. Reload the screen to retry. If the
            issue persists, platform support should inspect the current deployment logs.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: '1rem 0 0',
                fontSize: '0.85rem',
                color: '#64748b',
              }}
            >
              Digest: {error.digest}
            </p>
          ) : null}
          <button
            onClick={reset}
            style={{
              marginTop: '1.25rem',
              height: '2.75rem',
              border: 'none',
              borderRadius: '0.85rem',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 600,
              padding: '0 1rem',
              cursor: 'pointer',
            }}
            type="button"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
