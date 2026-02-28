/**
 * HarveLogix AI - Shadow System
 * 
 * Elevation-based shadows for depth and hierarchy
 * Inspired by Material Design principles adapted for Indian digital aesthetics
 */

export const shadows = {
  // Elevation levels
  none: 'none',

  // Subtle shadows for cards and containers
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

  // Hover/Interactive shadows
  hover: '0 8px 12px -2px rgba(36, 87, 167, 0.15)',
  active: '0 4px 8px -1px rgba(36, 87, 167, 0.2)',

  // Focus shadows (for accessibility)
  focus: '0 0 0 3px rgba(36, 87, 167, 0.1), 0 0 0 1px rgba(36, 87, 167, 0.5)',

  // Inset shadows
  inset: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Colored shadows (for semantic meaning)
  success: '0 4px 12px -2px rgba(40, 167, 69, 0.15)',
  warning: '0 4px 12px -2px rgba(255, 193, 7, 0.15)',
  error: '0 4px 12px -2px rgba(220, 53, 69, 0.15)',
  info: '0 4px 12px -2px rgba(23, 162, 184, 0.15)',
}

export type ShadowKey = keyof typeof shadows
