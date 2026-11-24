interface BrandMarkProps {
  className?: string;
  inverted?: boolean;
}

export function BrandMark({ className = 'h-8 w-8', inverted = false }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center rounded-lg border transition-colors ${
        inverted
          ? 'border-slate-700 bg-[#132842] text-white'
          : 'border-[#0B192C]/15 bg-[#0B192C] text-white'
      } ${className}`}
    >
      <svg viewBox="0 0 28 28" className="h-5 w-5" fill="none">
        {/* Outer architectural diamond frame */}
        <path
          d="M14 3.25L24.75 14L14 24.75L3.25 14L14 3.25Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Connecting meridian bridge */}
        <path
          d="M7.5 14H20.5M14 7.5V20.5"
          stroke="currentColor"
          strokeOpacity="0.45"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Saffron junction node */}
        <circle cx="14" cy="14" r="2.6" fill="#D97724" />
        {/* Secondary discovery nodes */}
        <circle cx="14" cy="7.5" r="1.35" fill="currentColor" />
        <circle cx="20.5" cy="14" r="1.35" fill="currentColor" />
      </svg>
    </span>
  );
}

export function HorizonRule({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex h-[2px] w-full overflow-hidden ${className}`}>
      <span className="h-full w-[72%] bg-[#0B192C]" />
      <span className="h-full w-[18%] bg-[#0E6B6E]" />
      <span className="h-full w-[10%] bg-[#C46316]" />
    </div>
  );
}
