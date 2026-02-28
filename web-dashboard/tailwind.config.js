export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // India Digital Color Palette
      colors: {
        // Primary - Deep Blue (Trust, Governance)
        primary: {
          50: '#E8F0F8',
          100: '#D1E1F1',
          200: '#A3C3E3',
          300: '#75A5D5',
          400: '#4787C7',
          500: '#2457A7',
          600: '#1D4285',
          700: '#163363',
          800: '#0F2241',
          900: '#081120',
        },
        // Secondary - Forest Green (Growth, Agriculture)
        secondary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#1E8A43',
          600: '#1B7A3A',
          700: '#186A31',
          800: '#155A28',
          900: '#0F3A1F',
        },
        // Accent - Vivid Orange (Energy, Action)
        accent: {
          50: '#FEF3E8',
          100: '#FDE7D1',
          200: '#FBCFA3',
          300: '#F9B775',
          400: '#F79F47',
          500: '#F36D20',
          600: '#E05A1A',
          700: '#C94714',
          800: '#B2340E',
          900: '#8B2608',
        },
        // Semantic Colors
        success: '#28A745',
        warning: '#FFC107',
        error: '#DC3545',
        info: '#17A2B8',
      },

      // Typography - Noto Sans
      fontFamily: {
        sans: '"Noto Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        mono: '"Noto Sans Mono", "Courier New", monospace',
      },

      // Spacing
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
      },

      // Border Radius
      borderRadius: {
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },

      // Shadows
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        hover: '0 8px 12px -2px rgba(36, 87, 167, 0.15)',
        focus: '0 0 0 3px rgba(36, 87, 167, 0.1), 0 0 0 1px rgba(36, 87, 167, 0.5)',
      },

      // Gradients
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2457A7 0%, #1D4285 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #1E8A43 0%, #155A28 100%)',
        'gradient-accent': 'linear-gradient(135deg, #F36D20 0%, #E05A1A 100%)',
        'gradient-chakra': 'conic-gradient(from 0deg, #2457A7, #1E8A43, #F36D20, #2457A7)',
      },

      // Transitions
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
      },
    },
  },
  plugins: [],
}

