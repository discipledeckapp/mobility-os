export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M2 12L5 5L8 9L11 6L14 12H2Z"
                fill="white"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink">Mobiris</span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-500 font-medium">
          <a href="#how-it-works" className="hover:text-ink transition-colors">How it works</a>
          <a href="#use-cases" className="hover:text-ink transition-colors">Who it's for</a>
          <a href="#trust" className="hover:text-ink transition-colors">Why trust us</a>
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="https://app.mobiris.ng"
            className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-ink transition-colors"
          >
            Sign in
          </a>
          <a
            href="https://wa.me/2348053108039?text=Hi%2C%20I%27d%20like%20to%20request%20a%20demo%20of%20Mobiris"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Request a demo
          </a>
        </div>
      </div>
    </header>
  );
}
