const trustItems = [
  {
    title: 'Identity verification',
    body: 'Every driver goes through document and biometric checks before they touch your vehicles. You know exactly who you hired.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: 'Guarantor system',
    body: 'Capture and verify guarantors before any assignment. If a driver disappears, you know who is responsible.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'Signed assignments',
    body: 'Every driver-vehicle pairing is a formal record. Terms, dates, and agreement — documented and stored.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <polyline points="9 15 11 17 15 13" />
      </svg>
    ),
  },
  {
    title: 'Full payment history',
    body: "Every remittance logged with timestamps. No more disputes about who paid what, and when. The record is always there.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

export function TrustControl() {
  return (
    <section id="trust" className="bg-white py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — text */}
          <div>
            <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-4">
              Built for trust
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink leading-tight tracking-tight mb-5">
              Control is not about distrust.
              <br />
              It's about running a proper business.
            </h2>
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              When a driver knows their identity is verified and their guarantor
              is on file, they operate differently. When you have records,
              disputes disappear.
            </p>
            <a
              href="https://wa.me/2348053108039?text=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Mobiris"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
            >
              Talk to us about your fleet
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </div>

          {/* Right — trust cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="bg-slate-50 border border-slate-200 rounded-xl p-5"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-600 mb-4">
                  {item.icon}
                </div>
                <h3 className="text-sm font-semibold text-ink mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
