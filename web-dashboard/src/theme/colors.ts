/**
 * HarveLogix AI - Color Palette
 * Inspired by India's Digital India & AI for Bharat initiatives
 * 
 * Color Philosophy:
 * - Deep Blue (#2457A7): Trust, governance, stability (primary)
 * - Forest Green (#1E8A43): Growth, agriculture, sustainability (secondary)
 * - Vivid Orange (#F36D20): Energy, action, urgency (accent)
 * - Neutral Greys: Accessibility, readability
 * - White: Clean, inclusive, accessible
 */

export const colors = {
  // Primary Palette - India Digital
  primary: {
    50: '#E8F0F8',
    100: '#D1E1F1',
    200: '#A3C3E3',
    300: '#75A5D5',
    400: '#4787C7',
    500: '#2457A7', // Main primary
    600: '#1D4285',
    700: '#163363',
    800: '#0F2241',
    900: '#081120',
  },

  // Secondary Palette - Agriculture & Growth
  secondary: {
    50: '#E8F5E9',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#1E8A43', // Main secondary
    600: '#1B7A3A',
    700: '#186A31',
    800: '#155A28',
    900: '#0F3A1F',
  },

  // Accent Palette - Action & Urgency
  accent: {
    50: '#FEF3E8',
    100: '#FDE7D1',
    200: '#FBCFA3',
    300: '#F9B775',
    400: '#F79F47',
    500: '#F36D20', // Main accent
    600: '#E05A1A',
    700: '#C94714',
    800: '#B2340E',
    900: '#8B2608',
  },

  // Semantic Colors
  success: {
    light: '#D4EDDA',
    main: '#28A745',
    dark: '#1E7E34',
  },

  warning: {
    light: '#FFF3CD',
    main: '#FFC107',
    dark: '#E0A800',
  },

  error: {
    light: '#F8D7DA',
    main: '#DC3545',
    dark: '#C82333',
  },

  info: {
    light: '#D1ECF1',
    main: '#17A2B8',
    dark: '#0C5460',
  },

  // Neutral Palette
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #2457A7 0%, #1D4285 100%)',
    secondary: 'linear-gradient(135deg, #1E8A43 0%, #155A28 100%)',
    accent: 'linear-gradient(135deg, #F36D20 0%, #E05A1A 100%)',
    chakra: 'conic-gradient(from 0deg, #2457A7, #1E8A43, #F36D20, #2457A7)', // Ashoka Chakra inspired
  },

  // Status Colors
  status: {
    healthy: '#28A745',
    degraded: '#FFC107',
    critical: '#DC3545',
    inactive: '#6B7280',
  },
}

export type ColorToken = keyof typeof colors
