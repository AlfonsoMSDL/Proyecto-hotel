import React, { createContext, useContext, useEffect, useState } from 'react';

const THEMES = {
  dark: {
    '--color-bg': '#161826',
    '--color-surface': '#232532',
    '--color-text': '#e9e9ed',
  },
  light: {
    '--color-bg': '#f7f6f9',
    '--color-surface': '#ffffff',
    '--color-text': '#232438',
    '--color-divider': 'color-mix(in srgb, #232438 16%, transparent)',
  },
};

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('verdant-theme') || 'dark');

  useEffect(() => {
    localStorage.setItem('verdant-theme', theme);
    const vars = THEMES[theme];
    Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
    if (theme === 'dark') {
      document.documentElement.style.removeProperty('--color-divider');
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
