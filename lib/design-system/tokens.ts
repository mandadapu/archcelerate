export const designTokens = {
  colors: {
    // Brand colors
    brand: {
      50: 'hsl(221, 83%, 97%)',
      100: 'hsl(221, 77%, 94%)',
      200: 'hsl(221, 76%, 88%)',
      300: 'hsl(221, 75%, 79%)',
      400: 'hsl(221, 71%, 68%)',
      500: 'hsl(221, 68%, 56%)',
      600: 'hsl(221, 54%, 48%)',
      700: 'hsl(221, 54%, 40%)',
      800: 'hsl(221, 52%, 33%)',
      900: 'hsl(221, 47%, 28%)',
      950: 'hsl(221, 46%, 18%)'
    },
    // Semantic colors
    semantic: {
      success: 'hsl(142, 76%, 36%)',
      warning: 'hsl(38, 92%, 50%)',
      error: 'hsl(0, 84%, 60%)',
      info: 'hsl(199, 89%, 48%)'
    },
    // Neutral colors
    neutral: {
      50: 'hsl(210, 40%, 98%)',
      100: 'hsl(210, 40%, 96%)',
      200: 'hsl(214, 32%, 91%)',
      300: 'hsl(213, 27%, 84%)',
      400: 'hsl(215, 20%, 65%)',
      500: 'hsl(215, 16%, 47%)',
      600: 'hsl(215, 19%, 35%)',
      700: 'hsl(215, 25%, 27%)',
      800: 'hsl(217, 33%, 17%)',
      900: 'hsl(222, 47%, 11%)',
      950: 'hsl(229, 84%, 5%)'
    }
  },

  typography: {
    fontFamily: {
      sans: 'var(--font-inter)',
      mono: 'var(--font-mono)'
    },
    fontSize: {
      xs: ['0.75rem' as const, { lineHeight: '1rem' as const }] as [string, { lineHeight: string }],
      sm: ['0.875rem' as const, { lineHeight: '1.25rem' as const }] as [string, { lineHeight: string }],
      base: ['1rem' as const, { lineHeight: '1.5rem' as const }] as [string, { lineHeight: string }],
      lg: ['1.125rem' as const, { lineHeight: '1.75rem' as const }] as [string, { lineHeight: string }],
      xl: ['1.25rem' as const, { lineHeight: '1.75rem' as const }] as [string, { lineHeight: string }],
      '2xl': ['1.5rem' as const, { lineHeight: '2rem' as const }] as [string, { lineHeight: string }],
      '3xl': ['1.875rem' as const, { lineHeight: '2.25rem' as const }] as [string, { lineHeight: string }],
      '4xl': ['2.25rem' as const, { lineHeight: '2.5rem' as const }] as [string, { lineHeight: string }],
      '5xl': ['3rem' as const, { lineHeight: '1' as const }] as [string, { lineHeight: string }],
      '6xl': ['3.75rem' as const, { lineHeight: '1' as const }] as [string, { lineHeight: string }]
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  },

  spacing: {
    0: '0px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem'
  },

  borderRadius: {
    none: '0px',
    sm: '0.125rem',
    DEFAULT: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none'
  },

  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms'
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  }
} as const

export type DesignTokens = typeof designTokens
