export default function ControlPlaneServerErrorPage() {
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
          Platform page could not load
        </h1>
        <p style={{ margin: '0.9rem 0 0', color: '#475569', lineHeight: 1.6 }}>
          A server-side exception interrupted this platform-admin page. Please retry shortly.
        </p>
      </div>
    </main>
  );
}
