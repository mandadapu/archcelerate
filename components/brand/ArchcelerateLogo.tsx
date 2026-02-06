interface ArchcelerateLogoProps {
  variant?: 'full' | 'compact' | 'icon'
  className?: string
}

export function ArchcelerateLogo({ variant = 'full', className = '' }: ArchcelerateLogoProps) {
  if (variant === 'icon') {
    // Icon only - Metallic A with circuits
    return (
      <svg
        viewBox="0 0 200 200"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="iconMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <radialGradient id="iconGlow" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dark background */}
        <rect width="200" height="200" fill="#1a1a1a" />

        {/* Glow effect */}
        <circle cx="100" cy="100" r="80" fill="url(#iconGlow)" />

        {/* Neural network circuits - background layer */}
        <g opacity="0.4">
          <circle cx="40" cy="50" r="3" fill="#06b6d4" />
          <circle cx="55" cy="35" r="2" fill="#06b6d4" />
          <circle cx="70" cy="45" r="2.5" fill="#06b6d4" />
          <circle cx="160" cy="60" r="3" fill="#06b6d4" />
          <circle cx="145" cy="80" r="2" fill="#06b6d4" />
          <circle cx="50" cy="120" r="2.5" fill="#06b6d4" />
          <circle cx="150" cy="140" r="2.5" fill="#06b6d4" />

          <line x1="40" y1="50" x2="55" y2="35" stroke="#06b6d4" strokeWidth="1" />
          <line x1="55" y1="35" x2="70" y2="45" stroke="#06b6d4" strokeWidth="1" />
          <line x1="160" y1="60" x2="145" y2="80" stroke="#06b6d4" strokeWidth="1" />
          <line x1="50" y1="120" x2="70" y2="110" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
          <line x1="150" y1="140" x2="130" y2="130" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
        </g>

        {/* Large metallic A */}
        <path
          d="M 60 160 L 100 40 L 140 160 M 75 120 L 125 120"
          stroke="url(#iconMetallic)"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* A inner shadow for depth */}
        <path
          d="M 65 160 L 100 50 L 135 160 M 77 120 L 123 120"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.4"
        />

        {/* Purple-cyan speed lines - horizontal */}
        <g opacity="0.9">
          <rect x="20" y="95" width="80" height="4" fill="#a855f7" rx="2" />
          <rect x="20" y="105" width="80" height="4" fill="#7c3aed" rx="2" />
          <rect x="20" y="115" width="80" height="4" fill="#9333ea" rx="2" />
        </g>
      </svg>
    )
  }

  if (variant === 'compact') {
    // Compact - A + text for header
    return (
      <svg
        viewBox="0 0 400 80"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="compactMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Neural network dots */}
        <g opacity="0.5">
          <circle cx="12" cy="20" r="1.5" fill="#06b6d4" />
          <circle cx="22" cy="15" r="1" fill="#06b6d4" />
          <circle cx="18" cy="28" r="1" fill="#06b6d4" />
          <line x1="12" y1="20" x2="22" y2="15" stroke="#06b6d4" strokeWidth="0.5" />
          <line x1="22" y1="15" x2="18" y2="28" stroke="#06b6d4" strokeWidth="0.5" />
        </g>

        {/* Metallic A icon */}
        <path
          d="M 20 65 L 40 20 L 60 65 M 30 48 L 50 48"
          stroke="url(#compactMetallic)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* A highlight */}
        <path
          d="M 24 65 L 40 28 L 56 65 M 32 48 L 48 48"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.5"
        />

        {/* Purple speed lines */}
        <g opacity="0.8">
          <rect x="8" y="38" width="28" height="2" fill="#a855f7" rx="1" />
          <rect x="8" y="43" width="28" height="2" fill="#7c3aed" rx="1" />
          <rect x="8" y="48" width="28" height="2" fill="#9333ea" rx="1" />
        </g>

        {/* Archcelerate Text */}
        <text
          x="85"
          y="52"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="38"
          letterSpacing="-0.03em"
        >
          <tspan fill="#06b6d4">Arch</tspan>
          <tspan fill="#1e293b">celerate</tspan>
        </text>
      </svg>
    )
  }

  // Full logo with tagline
  return (
    <svg
      viewBox="0 0 600 140"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="fullMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <radialGradient id="fullGlow" cx="30%" cy="40%">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Glow background */}
      <ellipse cx="60" cy="50" rx="60" ry="50" fill="url(#fullGlow)" />

      {/* Neural network circuits */}
      <g opacity="0.4">
        <circle cx="20" cy="25" r="2.5" fill="#06b6d4" />
        <circle cx="35" cy="18" r="1.5" fill="#06b6d4" />
        <circle cx="45" cy="30" r="2" fill="#06b6d4" />
        <circle cx="90" cy="35" r="2.5" fill="#06b6d4" />
        <circle cx="80" cy="55" r="1.5" fill="#06b6d4" />

        <line x1="20" y1="25" x2="35" y2="18" stroke="#06b6d4" strokeWidth="1" />
        <line x1="35" y1="18" x2="45" y2="30" stroke="#06b6d4" strokeWidth="1" />
        <line x1="90" y1="35" x2="80" y2="55" stroke="#06b6d4" strokeWidth="1" />
        <line x1="45" y1="30" x2="60" y2="45" stroke="#06b6d4" strokeWidth="1" opacity="0.5" />
      </g>

      {/* Large metallic A */}
      <path
        d="M 30 90 L 60 20 L 90 90 M 45 65 L 75 65"
        stroke="url(#fullMetallic)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* A highlight for depth */}
      <path
        d="M 34 90 L 60 28 L 86 90 M 47 65 L 73 65"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.5"
      />

      {/* Purple speed lines - horizontal through A */}
      <g opacity="0.85">
        <rect x="15" y="52" width="50" height="3" fill="#a855f7" rx="1.5" />
        <rect x="15" y="59" width="50" height="3" fill="#7c3aed" rx="1.5" />
        <rect x="15" y="66" width="50" height="3" fill="#9333ea" rx="1.5" />
      </g>

      {/* Archcelerate Text */}
      <text
        x="120"
        y="68"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize="52"
        letterSpacing="-0.03em"
      >
        <tspan fill="#06b6d4">Arch</tspan>
        <tspan fill="#1e293b">celerate</tspan>
      </text>

      {/* Tagline */}
      <text
        x="120"
        y="105"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize="18"
        letterSpacing="0.02em"
      >
        <tspan fill="#06b6d4">Build AI Products.</tspan>
        <tspan fill="#64748b"> Harden Systems. </tspan>
        <tspan fill="#9333ea">Accelerate.</tspan>
      </text>
    </svg>
  )
}
