export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Subtle background tint */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        {/* Label pill */}
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-8 tracking-wide uppercase">
          Fleet & Driver Operations Platform
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold text-ink leading-tight tracking-tight mb-6">
          Stop losing money
          <br />
          on your fleet.
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10">
          Mobiris gives you a clear record of every driver, every vehicle, and
          every payment. No more notebooks. No more guessing. Just structure.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://app.mobiris.ng"
            className="w-full sm:w-auto inline-flex items-center justify-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base px-7 py-3.5 rounded-lg transition-colors shadow-sm"
          >
            Get started free
          </a>
          <a
            href="https://wa.me/2348053108039?text=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Mobiris"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-ink font-semibold text-base px-7 py-3.5 rounded-lg transition-colors shadow-sm"
          >
            {/* WhatsApp icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-green-500" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Request a demo
          </a>
        </div>

        {/* Social proof micro-text */}
        <p className="mt-8 text-sm text-slate-400">
          Used by transport and logistics operators across Nigeria
        </p>
      </div>

      {/* Dashboard preview placeholder */}
      <div className="relative max-w-5xl mx-auto px-6 mt-16">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-soft">
          {/* Browser chrome bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="ml-4 flex-1 bg-white rounded-md h-5 max-w-xs opacity-60" />
          </div>
          {/* Dashboard mock */}
          <div className="p-6 md:p-10 bg-slate-50 min-h-[240px] md:min-h-[320px] flex flex-col gap-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Active Drivers', value: '48' },
                { label: "Today's Remittance", value: '₦384,000' },
                { label: 'Vehicles Assigned', value: '43' },
                { label: 'Overdue Payments', value: '5' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-card"
                >
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-ink">{stat.value}</p>
                </div>
              ))}
            </div>
            {/* Table mock */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">Recent activity</p>
                <div className="h-4 w-16 rounded bg-slate-100" />
              </div>
              <div className="divide-y divide-slate-50">
                {[
                  { name: 'Chukwuemeka O.', status: 'Paid', amount: '₦8,000', color: 'text-green-600 bg-green-50' },
                  { name: 'Adebayo M.', status: 'Pending', amount: '₦8,000', color: 'text-yellow-600 bg-yellow-50' },
                  { name: 'Ifeanyi N.', status: 'Paid', amount: '₦8,000', color: 'text-green-600 bg-green-50' },
                ].map((row) => (
                  <div key={row.name} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-xs font-bold">
                        {row.name[0]}
                      </div>
                      <p className="text-sm font-medium text-ink">{row.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-slate-500">{row.amount}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.color}`}>
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
