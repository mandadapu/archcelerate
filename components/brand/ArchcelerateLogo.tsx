interface ArchcelerateLogoProps {
  variant?: 'full' | 'compact' | 'icon'
  className?: string
}

export function ArchcelerateLogo({ variant = 'full', className = '' }: ArchcelerateLogoProps) {
  if (variant === 'icon') {
    // Icon only - speed lines
    return (
      <svg
        viewBox="0 0 60 60"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="60" height="60" rx="12" fill="#1e293b"/>
        {/* Speed lines (chevrons) */}
        <path d="M15 20 L25 30 L15 40" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M25 20 L35 30 L25 40" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M35 20 L45 30 L35 40" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    )
  }

  if (variant === 'compact') {
    // Compact - name + speed lines, no tagline
    return (
      <svg
        viewBox="0 0 280 60"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Archcelerate Text */}
        <text
          x="0"
          y="40"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="36"
          letterSpacing="-0.02em"
        >
          <tspan fill="#3b82f6">Arch</tspan>
          <tspan fill="#1e293b">celerate</tspan>
        </text>

        {/* Speed lines (diagonal chevrons) */}
        <g transform="translate(230, 18)">
          <path d="M0 8 L8 16 L0 24" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M10 8 L18 16 L10 24" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <path d="M20 8 L28 16 L20 24" stroke="#ff6b35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </g>
      </svg>
    )
  }

  // Full logo with tagline
  return (
    <svg
      viewBox="0 0 420 90"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Archcelerate Text */}
      <text
        x="0"
        y="42"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        fontSize="40"
        letterSpacing="-0.02em"
      >
        <tspan fill="#3b82f6">Arch</tspan>
        <tspan fill="#1e293b">celerate</tspan>
      </text>

      {/* Speed lines (diagonal chevrons) */}
      <g transform="translate(320, 16)">
        <path d="M0 10 L10 20 L0 30" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M14 10 L24 20 L14 30" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M28 10 L38 20 L28 30" stroke="#ff6b35" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>

      {/* Tagline */}
      <text
        x="0"
        y="70"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="500"
        fontSize="13"
        fill="#64748b"
        letterSpacing="0.02em"
      >
        Build AI Products. Harden Systems. Accelerate.
      </text>
    </svg>
  )
}
