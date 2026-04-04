interface MobirisMarkProps {
  className?: string;
}

export function MobirisMark({ className = 'h-8 w-8' }: MobirisMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 44 44"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="url(#mobirisMarkGradient)" height="44" rx="12" width="44" />
      <rect fill="white" height="24" rx="2.5" width="5" x="10" y="10" />
      <rect fill="white" height="24" rx="2.5" width="5" x="29" y="10" />
      <path d="M14.5 12L22 21" stroke="white" strokeLinecap="round" strokeWidth="5" />
      <path d="M29.5 12L22 21" stroke="white" strokeLinecap="round" strokeWidth="5" />
      <rect fill="white" height="6.5" rx="3.25" width="26" x="9" y="24.5" />
      <rect fill="#BFDBFE" height="13.5" rx="1.8" width="3.6" x="20.2" y="13" />
      <defs>
        <linearGradient id="mobirisMarkGradient" x1="5" x2="39" y1="4" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1E40AF" />
          <stop offset="0.62" stopColor="#2563EB" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
    </svg>
  );
}
