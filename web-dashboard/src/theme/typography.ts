/**
 * HarveLogix AI - Typography System
 * 
 * Font Family: Noto Sans
 * - Excellent support for Indic scripts (Hindi, Tamil, Kannada, Telugu, Marathi, Bengali)
 * - Clean, modern, highly legible
 * - Aligns with Indian government digital design guidelines
 * 
 * Scale: 8px base unit (Tailwind default)
 * Weights: 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
 */

export const typography = {
  fontFamily: {
    primary: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"Noto Sans Mono", "Courier New", monospace',
  },

  // Heading Styles
  heading: {
    h1: {
      fontSize: '2.5rem', // 40px
      lineHeight: '1.2',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem', // 32px
      lineHeight: '1.3',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem', // 24px
      lineHeight: '1.4',
      fontWeight: 600,
      letterSpacing: '0',
    },
    h4: {
      fontSize: '1.25rem', // 20px
      lineHeight: '1.4',
      fontWeight: 600,
      letterSpacing: '0',
    },
    h5: {
      fontSize: '1rem', // 16px
      lineHeight: '1.5',
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h6: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },

  // Body Styles
  body: {
    large: {
      fontSize: '1rem', // 16px
      lineHeight: '1.6',
      fontWeight: 400,
      letterSpacing: '0',
    },
    regular: {
      fontSize: '0.9375rem', // 15px
      lineHeight: '1.6',
      fontWeight: 400,
      letterSpacing: '0',
    },
    small: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: 400,
      letterSpacing: '0.01em',
    },
  },

  // Label & Caption Styles
  label: {
    large: {
      fontSize: '0.875rem', // 14px
      lineHeight: '1.5',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    regular: {
      fontSize: '0.8125rem', // 13px
      lineHeight: '1.5',
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    small: {
      fontSize: '0.75rem', // 12px
      lineHeight: '1.4',
      fontWeight: 500,
      letterSpacing: '0.03em',
    },
  },

  caption: {
    fontSize: '0.75rem', // 12px
    lineHeight: '1.4',
    fontWeight: 400,
    letterSpacing: '0.02em',
  },

  // Utility Styles
  button: {
    fontSize: '0.9375rem', // 15px
    lineHeight: '1.5',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },

  code: {
    fontSize: '0.8125rem', // 13px
    lineHeight: '1.5',
    fontWeight: 400,
    letterSpacing: '0',
  },
}

export type TypographyKey = keyof typeof typography
