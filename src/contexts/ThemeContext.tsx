import React, { createContext, useContext, useState, useEffect } from 'react';

export type PastelTheme = 'pastel-delight' | 'high-contrast' | 'soft-lavender';
export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  pastelTheme: PastelTheme;
  colorMode: ColorMode;
  effectiveMode: 'light' | 'dark';
  setPastelTheme: (theme: PastelTheme) => void;
  setColorMode: (mode: ColorMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'quizzy_pastel_theme';
const MODE_STORAGE_KEY = 'quizzy_color_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pastelTheme, setPastelThemeState] = useState<PastelTheme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'high-contrast' || saved === 'soft-lavender' ? saved : 'pastel-delight';
  });

  const [colorMode, setColorModeState] = useState<ColorMode>(() => {
    const saved = localStorage.getItem(MODE_STORAGE_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveMode: 'light' | 'dark' =
    colorMode === 'system' ? (systemIsDark ? 'dark' : 'light') : colorMode;

  const setPastelTheme = (theme: PastelTheme) => {
    setPastelThemeState(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  };

  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', pastelTheme);
    root.setAttribute('data-mode', effectiveMode);

    if (effectiveMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [pastelTheme, effectiveMode]);

  return (
    <ThemeContext.Provider
      value={{
        pastelTheme,
        colorMode,
        effectiveMode,
        setPastelTheme,
        setColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
