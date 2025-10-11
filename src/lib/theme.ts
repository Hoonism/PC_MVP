/**
 * JourneyBook Theme Configuration
 * Centralized theme constants for consistent styling across the application
 */

export type ThemeMode = 'light' | 'dark';

export const lightTheme = {
  // Color Palette - Minimalistic Windsurf-inspired
  colors: {
    // Primary Colors - Subtle blues
    primary: {
      50: 'bg-slate-50',
      100: 'bg-slate-100',
      500: 'bg-slate-600',
      600: 'bg-slate-700',
      700: 'bg-slate-800',
    },
    
    // Text Colors - Muted and readable
    primaryText: {
      50: 'text-slate-400',
      100: 'text-slate-500',
      500: 'text-slate-600',
      600: 'text-slate-700',
      700: 'text-slate-800',
    },
    
    // Border Colors - Very subtle
    primaryBorder: {
      500: 'border-slate-200',
      600: 'border-slate-300',
    },
    
    // Gray Scale - Clean neutrals
    gray: {
      50: 'bg-white',
      100: 'bg-gray-50',
      200: 'bg-gray-100',
      300: 'bg-gray-200',
      600: 'bg-gray-500',
      700: 'bg-gray-600',
      800: 'bg-gray-700',
      900: 'bg-gray-800',
    },
    
    // Text Gray - Subtle hierarchy
    grayText: {
      600: 'text-gray-500',
      700: 'text-gray-600',
      800: 'text-gray-700',
      900: 'text-gray-900',
    },
    
    // Border Gray - Minimal borders
    grayBorder: {
      200: 'border-gray-100',
      300: 'border-gray-200',
    },
    
    // Status Colors - Muted
    success: {
      600: 'bg-emerald-500',
      700: 'bg-emerald-600',
    },
    
    error: {
      500: 'bg-red-400',
      600: 'bg-red-500',
    },
    
    // Background - Clean whites
    background: {
      primary: 'bg-white',
      card: 'bg-white',
    }
  },
  
  // Component Styles - Minimalistic and clean
  components: {
    // Button Styles - Subtle and refined
    button: {
      primary: 'bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 text-sm',
      secondary: 'bg-white border border-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-md hover:bg-gray-50 transition-all duration-200 text-sm',
      danger: 'bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 text-sm',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 text-sm',
      ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-medium py-2 px-3 rounded-md transition-all duration-200 text-sm',
    },
    
    // Input Styles - Clean and minimal
    input: {
      base: 'w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-gray-900 transition-all duration-200 text-sm placeholder:text-gray-400',
      small: 'w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-gray-900 placeholder:text-gray-400',
      textarea: 'w-full px-3 py-2.5 border border-gray-200 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 resize-none text-gray-900 transition-all duration-200 text-sm placeholder:text-gray-400',
    },
    
    // Card Styles - Minimal shadows and borders
    card: {
      base: 'bg-white rounded-lg border border-gray-100',
      elevated: 'bg-white rounded-lg border border-gray-100 shadow-sm',
      interactive: 'bg-white rounded-lg border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 cursor-pointer',
    },
    
    // Layout Styles - Generous spacing
    layout: {
      container: 'max-w-6xl mx-auto px-6 lg:px-8',
      section: 'py-12',
      header: 'mb-8',
    }
  },
  
  // Typography - Clean and readable
  typography: {
    heading: {
      h1: 'text-2xl font-semibold text-gray-900 tracking-tight',
      h2: 'text-xl font-semibold text-gray-900 tracking-tight',
      h3: 'text-lg font-medium text-gray-900',
      h4: 'text-base font-medium text-gray-900',
    },
    
    body: {
      large: 'text-base text-gray-600',
      base: 'text-sm text-gray-700',
      small: 'text-xs text-gray-500',
    }
  },
  
  // Spacing - More generous and consistent
  spacing: {
    section: 'space-y-6',
    form: 'space-y-4',
    buttonGroup: 'flex flex-col sm:flex-row gap-3',
  }
} as const;

export const darkTheme = {
  // Color Palette - Minimalistic dark theme
  colors: {
    // Primary Colors - Muted in dark mode
    primary: {
      50: 'bg-slate-800',
      100: 'bg-slate-700',
      500: 'bg-slate-400',
      600: 'bg-slate-300',
      700: 'bg-slate-200',
    },
    
    // Text Colors - Light and readable
    primaryText: {
      50: 'text-slate-300',
      100: 'text-slate-200',
      500: 'text-slate-300',
      600: 'text-slate-200',
      700: 'text-slate-100',
    },
    
    // Border Colors - Subtle in dark
    primaryBorder: {
      500: 'border-slate-600',
      600: 'border-slate-500',
    },
    
    // Gray Scale - Dark mode grays
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
    
    // Text Gray - Dark mode text hierarchy
    grayText: {
      600: 'text-gray-400',
      700: 'text-gray-300',
      800: 'text-gray-200',
      900: 'text-gray-100',
    },
    
    // Border Gray - Dark borders
    grayBorder: {
      200: 'border-gray-700',
      300: 'border-gray-600',
    },
    
    // Status Colors - Muted in dark
    success: {
      600: 'bg-emerald-600',
      700: 'bg-emerald-500',
    },
    
    error: {
      500: 'bg-red-500',
      600: 'bg-red-400',
    },
    
    // Background - Dark backgrounds
    background: {
      primary: 'bg-gray-900',
      card: 'bg-gray-800',
    }
  },
  
  // Component Styles - Dark mode minimalistic
  components: {
    // Button Styles - Refined dark buttons
    button: {
      primary: 'bg-slate-600 hover:bg-slate-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 text-sm',
      secondary: 'bg-gray-800 border border-gray-600 text-gray-300 font-medium py-2.5 px-4 rounded-md hover:bg-gray-700 transition-all duration-200 text-sm',
      danger: 'bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition-all duration-200 text-sm',
      success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-md transition-all duration-200 text-sm',
      ghost: 'text-gray-400 hover:text-gray-200 hover:bg-gray-800 font-medium py-2 px-3 rounded-md transition-all duration-200 text-sm',
    },
    
    // Input Styles - Clean dark inputs
    input: {
      base: 'w-full px-3 py-2.5 border border-gray-600 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-gray-100 bg-gray-800 transition-all duration-200 text-sm placeholder:text-gray-500',
      small: 'w-full px-3 py-2 border border-gray-600 rounded-md text-sm focus:ring-1 focus:ring-slate-400 focus:border-slate-400 text-gray-100 bg-gray-800 placeholder:text-gray-500',
      textarea: 'w-full px-3 py-2.5 border border-gray-600 rounded-md focus:ring-1 focus:ring-slate-400 focus:border-slate-400 resize-none text-gray-100 bg-gray-800 transition-all duration-200 text-sm placeholder:text-gray-500',
    },
    
    // Card Styles - Minimal dark cards
    card: {
      base: 'bg-gray-800 rounded-lg border border-gray-700',
      elevated: 'bg-gray-800 rounded-lg border border-gray-700 shadow-sm',
      interactive: 'bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 hover:shadow-sm transition-all duration-200 cursor-pointer',
    },
    
    // Layout Styles - Generous spacing
    layout: {
      container: 'max-w-6xl mx-auto px-6 lg:px-8',
      section: 'py-12',
      header: 'mb-8',
    }
  },
  
  // Typography - Clean dark typography
  typography: {
    heading: {
      h1: 'text-2xl font-semibold text-gray-100 tracking-tight',
      h2: 'text-xl font-semibold text-gray-100 tracking-tight',
      h3: 'text-lg font-medium text-gray-200',
      h4: 'text-base font-medium text-gray-300',
    },
    
    body: {
      large: 'text-base text-gray-400',
      base: 'text-sm text-gray-300',
      small: 'text-xs text-gray-500',
    }
  },
  
  // Spacing - Consistent with light theme
  spacing: {
    section: 'space-y-6',
    form: 'space-y-4',
    buttonGroup: 'flex flex-col sm:flex-row gap-3',
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
