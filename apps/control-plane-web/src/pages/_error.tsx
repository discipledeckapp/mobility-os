import type { NextPageContext } from 'next';

type ErrorPageProps = {
  statusCode?: number;
};

function getMessage(statusCode?: number): string {
  if (statusCode === 404) {
    return 'The platform-admin route you requested is not available in this deployment.';
  }

  if (statusCode && statusCode >= 500) {
    return 'A server-side exception interrupted this platform-admin page. Please retry shortly.';
  }

  return 'The control-plane hit an unexpected error while loading this page.';
}

export default function ControlPlaneErrorPage({ statusCode }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 'min(32rem, 100%)',
          borderRadius: '1rem',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          background: '#fff',
          padding: '2rem',
          boxShadow: '0 24px 60px -32px rgba(15,23,42,0.24)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#1d4ed8',
          }}
        >
          Control plane
        </p>
        <h1 style={{ margin: '0.8rem 0 0', fontSize: '1.75rem' }}>
          {statusCode === 404 ? 'Page not found' : 'Platform page could not load'}
        </h1>
        <p style={{ margin: '0.9rem 0 0', color: '#475569', lineHeight: 1.6 }}>
          {getMessage(statusCode)}
        </p>
        {statusCode ? (
          <p style={{ margin: '1rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Status: {statusCode}
          </p>
        ) : null}
      </div>
    </main>
  );
}

ControlPlaneErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorPageProps => ({
  statusCode: res?.statusCode ?? err?.statusCode ?? 500,
});
