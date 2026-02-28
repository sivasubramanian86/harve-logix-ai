/**
 * HarveLogix AI - Spacing System
 * 
 * Base unit: 8px (Tailwind default)
 * Provides consistent, scalable spacing throughout the application
 */

export const spacing = {
  // Base units (in rem, where 1rem = 16px)
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem', // 48px
  '4xl': '4rem', // 64px

  // Component-specific spacing
  card: {
    padding: '1.5rem', // 24px
    gap: '1rem', // 16px
  },

  button: {
    paddingX: '1rem', // 16px
    paddingY: '0.625rem', // 10px
    gap: '0.5rem', // 8px
  },

  input: {
    padding: '0.75rem', // 12px
    gap: '0.5rem', // 8px
  },

  section: {
    padding: '2rem', // 32px
    gap: '1.5rem', // 24px
  },
}

export type SpacingKey = keyof typeof spacing
