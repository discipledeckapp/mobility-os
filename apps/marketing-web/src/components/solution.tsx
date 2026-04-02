const features = [
  {
    number: '01',
    title: 'Know your drivers',
    body: 'Verified identity, documents, and guarantors — before a vehicle ever leaves your yard.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Track your money',
    body: 'Daily remittance records for every driver. See who paid, who owes, and how much — at a glance.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Assign with confidence',
    body: 'Every vehicle linked to a named driver. Formal records. No disputes. Clear accountability.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'See your fleet',
    body: "One dashboard. Know what's active, what's overdue, and what needs your attention — right now.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

export function Solution() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <p className="text-brand-600 text-sm font-semibold uppercase tracking-wider mb-4">
            The solution
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-ink leading-tight tracking-tight">
            Everything you need to
            <br />
            run your fleet properly.
          </h2>
          <p className="mt-4 text-lg text-slate-500 leading-relaxed">
            Mobiris is built for operators who manage drivers, vehicles, and
            daily payments. Simple to use. Clear records. Full control.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => (
            <div
              key={feature.number}
              className="group relative bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-2xl p-7 transition-all duration-200"
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-white border border-slate-200 group-hover:border-brand-200 group-hover:bg-brand-50 flex items-center justify-center text-brand-600 shadow-card transition-all duration-200">
                  {feature.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    {feature.number}
                  </p>
                  <h3 className="text-lg font-semibold text-ink mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed text-base">
                    {feature.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
