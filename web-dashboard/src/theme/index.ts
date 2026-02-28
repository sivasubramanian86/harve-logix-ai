/**
 * HarveLogix AI - Unified Theme System
 * 
 * Central theme export combining all design tokens
 * Use this to maintain consistency across the application
 */

import { colors } from './colors'
import { typography } from './typography'
import { spacing } from './spacing'
import { shadows } from './shadows'

export const theme = {
  colors,
  typography,
  spacing,
  shadows,

  // Border radius scale
  borderRadius: {
    none: '0',
    sm: '0.25rem', // 4px
    md: '0.5rem', // 8px
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Transition/Animation
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
}

export type Theme = typeof theme

// Export individual modules for granular imports
export { colors } from './colors'
export { typography } from './typography'
export { spacing } from './spacing'
export { shadows } from './shadows'
