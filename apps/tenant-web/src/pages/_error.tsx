/**
 * Custom Pages Router error page — overrides Next.js's default _error.js.
 * Kept intentionally minimal (no UI library imports) to avoid hook issues during
 * static prerendering of the 404 and 500 fallback pages.
 */
function ErrorPage({ statusCode }: { statusCode: number }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        backgroundColor: '#f8fafc',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '1rem',
      }}
    >
      <p style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        {statusCode}
      </p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: 0 }}>
        {statusCode === 404 ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p style={{ color: '#64748b', margin: 0 }}>
        {statusCode === 404
          ? 'The page you are looking for does not exist.'
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <a
        href="/"
        style={{
          marginTop: 8,
          padding: '0.6rem 1.25rem',
          backgroundColor: '#1d4ed8',
          color: '#fff',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Back to dashboard
      </a>
    </div>
  );
}

ErrorPage.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};

export default ErrorPage;
