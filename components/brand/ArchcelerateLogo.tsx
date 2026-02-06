interface ArchcelerateLogoProps {
  variant?: 'full' | 'compact' | 'icon'
  className?: string
}

export function ArchcelerateLogo({ variant = 'full', className = '' }: ArchcelerateLogoProps) {
  if (variant === 'icon') {
    // Icon only - A with circuits and speed lines
    return (
      <svg
        viewBox="0 0 120 120"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="iconGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Neural network background circles */}
        <circle cx="30" cy="30" r="2" fill="#06b6d4" opacity="0.4" />
        <circle cx="45" cy="25" r="1.5" fill="#06b6d4" opacity="0.3" />
        <circle cx="35" cy="40" r="1.5" fill="#06b6d4" opacity="0.3" />
        <circle cx="90" cy="35" r="2" fill="#06b6d4" opacity="0.4" />
        <circle cx="85" cy="50" r="1.5" fill="#06b6d4" opacity="0.3" />

        {/* Connection lines */}
        <line x1="30" y1="30" x2="45" y2="25" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />
        <line x1="45" y1="25" x2="35" y2="40" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />
        <line x1="90" y1="35" x2="85" y2="50" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />

        {/* Large A letter */}
        <path
          d="M 40 90 L 60 30 L 80 90 M 50 70 L 70 70"
          stroke="url(#iconGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M 42 90 L 60 35 L 78 90 M 52 70 L 68 70"
          stroke="url(#iconGrad)"
          strokeWidth="6"
          fill="none"
          opacity="0.5"
        />

        {/* Orange speed arrow */}
        <g transform="translate(25, 55)">
          <path d="M 0 0 L 45 0 L 40 -4 M 45 0 L 40 4"
            stroke="url(#arrowGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="0" y1="-3" x2="40" y2="-3" stroke="url(#arrowGrad)" strokeWidth="1.5" opacity="0.6" />
          <line x1="0" y1="3" x2="40" y2="3" stroke="url(#arrowGrad)" strokeWidth="1.5" opacity="0.6" />
        </g>
      </svg>
    )
  }

  if (variant === 'compact') {
    // Compact - A icon + Archcelerate text
    return (
      <svg
        viewBox="0 0 320 60"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="compactAGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="compactArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Neural network dots */}
        <circle cx="8" cy="15" r="1.5" fill="#06b6d4" opacity="0.4" />
        <circle cx="16" cy="12" r="1" fill="#06b6d4" opacity="0.3" />
        <circle cx="12" cy="22" r="1" fill="#06b6d4" opacity="0.3" />
        <line x1="8" y1="15" x2="16" y2="12" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />

        {/* A letter icon */}
        <g transform="translate(-5, 0)">
          <path
            d="M 15 45 L 25 15 L 35 45 M 20 35 L 30 35"
            stroke="url(#compactAGrad)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Orange speed arrow */}
          <path d="M 10 28 L 32 28 L 30 26 M 32 28 L 30 30"
            stroke="url(#compactArrowGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <line x1="10" y1="26" x2="30" y2="26" stroke="url(#compactArrowGrad)" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Archcelerate Text */}
        <text
          x="50"
          y="40"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="32"
          letterSpacing="-0.02em"
        >
          <tspan fill="#06b6d4">Arch</tspan>
          <tspan fill="#1e293b">celerate</tspan>
        </text>

        {/* Speed lines next to text */}
        <g transform="translate(280, 22)">
          <line x1="0" y1="0" x2="8" y2="8" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="10" y1="0" x2="18" y2="8" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="0" x2="28" y2="8" stroke="#fb923c" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
    )
  }

  // Full logo with tagline
  return (
    <svg
      viewBox="0 0 500 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fullAGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id="fullArrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>

      {/* Neural network background */}
      <circle cx="15" cy="20" r="2" fill="#06b6d4" opacity="0.4" />
      <circle cx="28" cy="16" r="1.5" fill="#06b6d4" opacity="0.3" />
      <circle cx="20" cy="32" r="1.5" fill="#06b6d4" opacity="0.3" />
      <circle cx="65" cy="25" r="2" fill="#06b6d4" opacity="0.4" />
      <line x1="15" y1="20" x2="28" y2="16" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />
      <line x1="28" y1="16" x2="20" y2="32" stroke="#06b6d4" strokeWidth="0.5" opacity="0.2" />

      {/* Large A icon */}
      <g transform="translate(0, 5)">
        <path
          d="M 20 65 L 40 20 L 60 65 M 30 50 L 50 50"
          stroke="url(#fullAGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Orange speed arrow through A */}
        <path d="M 15 42 L 55 42 L 52 39 M 55 42 L 52 45"
          stroke="url(#fullArrowGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="15" y1="39" x2="50" y2="39" stroke="url(#fullArrowGrad)" strokeWidth="1.5" opacity="0.5" />
        <line x1="15" y1="45" x2="50" y2="45" stroke="url(#fullArrowGrad)" strokeWidth="1.5" opacity="0.5" />
      </g>

      {/* Archcelerate Text */}
      <text
        x="85"
        y="52"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize="42"
        letterSpacing="-0.02em"
      >
        <tspan fill="#06b6d4">Arch</tspan>
        <tspan fill="#1e293b">celerate</tspan>
      </text>

      {/* Speed lines accent */}
      <g transform="translate(440, 28)">
        <line x1="0" y1="0" x2="10" y2="10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        <line x1="15" y1="0" x2="25" y2="10" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
        <line x1="30" y1="0" x2="40" y2="10" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Tagline */}
      <text
        x="85"
        y="85"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize="16"
        letterSpacing="0.02em"
      >
        <tspan fill="#06b6d4">Build AI Products.</tspan>
        <tspan fill="#64748b"> Harden Systems. </tspan>
        <tspan fill="#f97316">Accelerate.</tspan>
      </text>
    </svg>
  )
}
