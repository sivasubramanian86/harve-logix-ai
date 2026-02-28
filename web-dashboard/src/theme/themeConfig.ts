export const lightTheme = {
  // Background colors
  bg: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#eeeeee',
    hover: '#f0f0f0',
  },
  // Text colors
  text: {
    primary: '#1a1a1a',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
  },
  // Border colors
  border: {
    primary: '#e0e0e0',
    secondary: '#d0d0d0',
  },
  // Semantic colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  // Component specific
  card: {
    bg: '#ffffff',
    border: '#e0e0e0',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  input: {
    bg: '#ffffff',
    border: '#d0d0d0',
    text: '#1a1a1a',
  },
};

export const darkTheme = {
  // Background colors
  bg: {
    primary: '#1a1a1a',
    secondary: '#2d2d2d',
    tertiary: '#3d3d3d',
    hover: '#333333',
  },
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#b0b0b0',
    tertiary: '#808080',
    inverse: '#1a1a1a',
  },
  // Border colors
  border: {
    primary: '#404040',
    secondary: '#505050',
  },
  // Semantic colors
  success: '#66bb6a',
  warning: '#ffa726',
  error: '#ef5350',
  info: '#42a5f5',
  // Component specific
  card: {
    bg: '#2d2d2d',
    border: '#404040',
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
  input: {
    bg: '#2d2d2d',
    border: '#404040',
    text: '#ffffff',
  },
};

export const themeVariables = {
  light: {
    '--bg-primary': lightTheme.bg.primary,
    '--bg-secondary': lightTheme.bg.secondary,
    '--bg-tertiary': lightTheme.bg.tertiary,
    '--bg-hover': lightTheme.bg.hover,
    '--text-primary': lightTheme.text.primary,
    '--text-secondary': lightTheme.text.secondary,
    '--text-tertiary': lightTheme.text.tertiary,
    '--text-inverse': lightTheme.text.inverse,
    '--border-primary': lightTheme.border.primary,
    '--border-secondary': lightTheme.border.secondary,
    '--color-success': lightTheme.success,
    '--color-warning': lightTheme.warning,
    '--color-error': lightTheme.error,
    '--color-info': lightTheme.info,
    '--card-bg': lightTheme.card.bg,
    '--card-border': lightTheme.card.border,
    '--card-shadow': lightTheme.card.shadow,
    '--input-bg': lightTheme.input.bg,
    '--input-border': lightTheme.input.border,
    '--input-text': lightTheme.input.text,
  },
  dark: {
    '--bg-primary': darkTheme.bg.primary,
    '--bg-secondary': darkTheme.bg.secondary,
    '--bg-tertiary': darkTheme.bg.tertiary,
    '--bg-hover': darkTheme.bg.hover,
    '--text-primary': darkTheme.text.primary,
    '--text-secondary': darkTheme.text.secondary,
    '--text-tertiary': darkTheme.text.tertiary,
    '--text-inverse': darkTheme.text.inverse,
    '--border-primary': darkTheme.border.primary,
    '--border-secondary': darkTheme.border.secondary,
    '--color-success': darkTheme.success,
    '--color-warning': darkTheme.warning,
    '--color-error': darkTheme.error,
    '--color-info': darkTheme.info,
    '--card-bg': darkTheme.card.bg,
    '--card-border': darkTheme.card.border,
    '--card-shadow': darkTheme.card.shadow,
    '--input-bg': darkTheme.input.bg,
    '--input-border': darkTheme.input.border,
    '--input-text': darkTheme.input.text,
  },
};
