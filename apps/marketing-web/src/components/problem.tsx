const pains = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    text: "You don't know who has paid today.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    text: "Drivers move between fleets with no record.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    text: "Everything is tracked in notebooks and WhatsApp.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    text: "You can't tell which vehicle belongs to whom.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="9" y1="12" x2="11" y2="14" />
        <line x1="15" y1="10" x2="11" y2="14" />
      </svg>
    ),
    text: "Your guarantors are unverified. Your risk is invisible.",
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    text: "You lose money because there is no structure.",
  },
];

export function Problem() {
  return (
    <section className="bg-ink py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-brand-400 text-sm font-semibold uppercase tracking-wider mb-4">
            Sound familiar?
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-white leading-tight tracking-tight">
            Running a fleet shouldn't
            <br />
            feel like this.
          </h2>
        </div>

        {/* Pain grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pains.map((pain) => (
            <div
              key={pain.text}
              className="flex items-start gap-4 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl p-5 transition-colors"
            >
              <div className="mt-0.5 text-brand-400 shrink-0">{pain.icon}</div>
              <p className="text-white/80 text-base leading-snug">{pain.text}</p>
            </div>
          ))}
        </div>

        {/* Bridge line */}
        <div className="mt-16 text-center">
          <p className="text-white/40 text-lg">
            You built your business on trust and hard work.
          </p>
          <p className="text-white text-xl font-semibold mt-1">
            It's time to back it up with structure.
          </p>
        </div>
      </div>
    </section>
  );
}
