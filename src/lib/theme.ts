/**
 * JourneyBook Theme Configuration
 * Centralized theme constants for consistent styling across the application
 */

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: 'bg-blue-50',
      100: 'bg-blue-100',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-700',
    },
    
    // Text Colors
    primaryText: {
      50: 'text-blue-50',
      100: 'text-blue-100',
      500: 'text-blue-500',
      600: 'text-blue-600',
      700: 'text-blue-700',
    },
    
    // Border Colors
    primaryBorder: {
      500: 'border-blue-500',
      600: 'border-blue-600',
    },
    
    // Gray Scale
    gray: {
      50: 'bg-gray-50',
      100: 'bg-gray-100',
      200: 'bg-gray-200',
      300: 'bg-gray-300',
      600: 'bg-gray-600',
      700: 'bg-gray-700',
      800: 'bg-gray-800',
      900: 'bg-gray-900',
    },
    
    // Text Gray
    grayText: {
      600: 'text-gray-600',
      700: 'text-gray-700',
      800: 'text-gray-800',
      900: 'text-gray-900',
    },
    
    // Border Gray
    grayBorder: {
      200: 'border-gray-200',
      300: 'border-gray-300',
    },
    
    // Status Colors
    success: {
      600: 'bg-green-600',
      700: 'bg-green-700',
    },
    
    error: {
      500: 'bg-red-500',
      600: 'bg-red-600',
    },
    
    // Background
    background: {
      primary: 'bg-gray-50',
      card: 'bg-white',
    }
  },
  
  // Component Styles
  components: {
    // Button Styles
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors',
      secondary: 'bg-white border-2 border-blue-500 text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors',
      danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
      success: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors',
    },
    
    // Input Styles
    input: {
      base: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-colors',
      small: 'w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900',
      textarea: 'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 transition-colors',
    },
    
    // Card Styles
    card: {
      base: 'bg-white rounded-lg border border-gray-200',
      elevated: 'bg-white rounded-lg border border-gray-200 shadow-sm',
      interactive: 'bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer',
    },
    
    // Layout Styles
    layout: {
      container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
      section: 'py-8',
      header: 'text-center mb-12',
    }
  },
  
  // Typography
  typography: {
    heading: {
      h1: 'text-4xl md:text-5xl font-bold text-gray-900',
      h2: 'text-3xl font-bold text-gray-900',
      h3: 'text-xl font-semibold text-gray-800',
      h4: 'text-lg font-semibold text-gray-700',
    },
    
    body: {
      large: 'text-xl text-gray-600',
      base: 'text-base text-gray-700',
      small: 'text-sm text-gray-600',
    }
  },
  
  // Spacing
  spacing: {
    section: 'space-y-8',
    form: 'space-y-6',
    buttonGroup: 'flex flex-col sm:flex-row gap-4',
  }
} as const;

export const darkTheme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: {
      50: 'bg-blue-900',
      100: 'bg-blue-800',
      500: 'bg-blue-500',
      600: 'bg-blue-600',
      700: 'bg-blue-400',
    },
    
    // Text Colors
    primaryText: {
      50: 'text-blue-400',
      100: 'text-blue-300',
      500: 'text-blue-400',
      600: 'text-blue-300',
      700: 'text-blue-200',
    },
    
    // Border Colors
    primaryBorder: {
      500: 'border-blue-400',
      600: 'border-blue-300',
    },
    
    // Gray Scale
    gray: {
      50: 'bg-gray-900',
      100: 'bg-gray-800',
      200: 'bg-gray-700',
      300: 'bg-gray-600',
      600: 'bg-gray-400',
      700: 'bg-gray-300',
      800: 'bg-gray-200',
      900: 'bg-gray-100',
    },
    
    // Text Gray
    grayText: {
      600: 'text-gray-400',
      700: 'text-gray-300',
      800: 'text-gray-200',
      900: 'text-gray-100',
    },
    
    // Border Gray
    grayBorder: {
      200: 'border-gray-700',
      300: 'border-gray-600',
    },
    
    // Status Colors
    success: {
      600: 'bg-green-600',
      700: 'bg-green-500',
    },
    
    error: {
      500: 'bg-red-500',
      600: 'bg-red-400',
    },
    
    // Background
    background: {
      primary: 'bg-gray-900',
      card: 'bg-gray-800',
    }
  },
  
  // Component Styles
  components: {
    // Button Styles
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors',
      secondary: 'bg-gray-800 border-2 border-blue-400 text-blue-400 font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors',
      danger: 'bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors',
      success: 'bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors',
    },
    
    // Input Styles
    input: {
      base: 'w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 bg-gray-800 transition-colors',
      small: 'w-full px-3 py-2 border border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 bg-gray-800',
      textarea: 'w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-100 bg-gray-800 transition-colors',
    },
    
    // Card Styles
    card: {
      base: 'bg-gray-800 rounded-lg border border-gray-700',
      elevated: 'bg-gray-800 rounded-lg border border-gray-700 shadow-lg',
      interactive: 'bg-gray-800 rounded-lg border border-gray-700 hover:shadow-xl transition-shadow cursor-pointer',
    },
    
    // Layout Styles
    layout: {
      container: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
      section: 'py-8',
      header: 'text-center mb-12',
    }
  },
  
  // Typography
  typography: {
    heading: {
      h1: 'text-4xl md:text-5xl font-bold text-gray-100',
      h2: 'text-3xl font-bold text-gray-100',
      h3: 'text-xl font-semibold text-gray-200',
      h4: 'text-lg font-semibold text-gray-300',
    },
    
    body: {
      large: 'text-xl text-gray-400',
      base: 'text-base text-gray-300',
      small: 'text-sm text-gray-400',
    }
  },
  
  // Spacing
  spacing: {
    section: 'space-y-8',
    form: 'space-y-6',
    buttonGroup: 'flex flex-col sm:flex-row gap-4',
  }
} as const;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

// Default theme (light)
export const theme = lightTheme;

// Utility functions for theme usage
export const getButtonClass = (variant: keyof typeof lightTheme.components.button, themeMode: ThemeMode = 'light') => {
  return themes[themeMode].components.button[variant];
};

export const getInputClass = (variant: keyof typeof lightTheme.components.input = 'base', themeMode: ThemeMode = 'light') => {
  return themes[themeMode].components.input[variant];
};

export const getCardClass = (variant: keyof typeof lightTheme.components.card = 'base', themeMode: ThemeMode = 'light') => {
  return themes[themeMode].components.card[variant];
};

export const getHeadingClass = (level: keyof typeof lightTheme.typography.heading, themeMode: ThemeMode = 'light') => {
  return themes[themeMode].typography.heading[level];
};

export const getBodyClass = (size: keyof typeof lightTheme.typography.body = 'base', themeMode: ThemeMode = 'light') => {
  return themes[themeMode].typography.body[size];
};

export const getBackgroundClass = (themeMode: ThemeMode = 'light') => {
  return themes[themeMode].colors.background.primary;
};

export const getCardBackgroundClass = (themeMode: ThemeMode = 'light') => {
  return themes[themeMode].colors.background.card;
};

// CSS-in-JS style objects for complex styling
export const getThemeStyles = (themeMode: ThemeMode = 'light') => ({
  input: {
    WebkitTextFillColor: themeMode === 'light' ? '#111827' : '#f3f4f6',
    WebkitBoxShadow: themeMode === 'light' ? '0 0 0 1000px white inset' : '0 0 0 1000px #1f2937 inset'
  }
});

export const themeStyles = getThemeStyles();

export default theme;
