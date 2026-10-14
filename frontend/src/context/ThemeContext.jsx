import React, { createContext, useContext, useEffect, useState } from 'react';

const THEMES = {
  dark: {
    '--color-bg': '#0f1412',
    '--color-surface': '#171d1a',
    '--color-sunken': '#1f2622',
    '--color-field': '#121815',
    '--color-text': '#e8ece9',
    '--color-text-muted': '#9aa5a0',
    '--color-border': '#2a332f',
    '--color-accent': '#5cc9a0',
    '--color-accent-hover': '#7dd8b5',
    '--color-on-accent': '#0b231a',
    '--color-accent-soft': '#173a2e',
    '--color-accent-strong': '#8fe0c0',
    '--color-warm-soft': '#3a2e18',
    '--color-warm-strong': '#f0cf8f',
    '--color-danger': '#f2a29b',
    '--color-danger-soft': '#2e1816',
    '--color-danger-border': '#5a2a26',
    '--color-overlay': 'rgba(4, 8, 6, 0.6)',
    '--shadow-card': '0 1px 0 rgba(255, 255, 255, 0.02), 0 8px 24px rgba(0, 0, 0, 0.35)',
  },
  light: {
    '--color-bg': '#f5f6f4',
    '--color-surface': '#ffffff',
    '--color-sunken': '#eceeea',
    '--color-field': '#ffffff',
    '--color-text': '#17211d',
    '--color-text-muted': '#5b6661',
    '--color-border': '#dde1dc',
    '--color-accent': '#1f7a5c',
    '--color-accent-hover': '#18664c',
    '--color-on-accent': '#ffffff',
    '--color-accent-soft': '#e3f1eb',
    '--color-accent-strong': '#165c45',
    '--color-warm-soft': '#f3ecdf',
    '--color-warm-strong': '#7a5418',
    '--color-danger': '#a3312a',
    '--color-danger-soft': '#fbecea',
    '--color-danger-border': '#efc7c3',
    '--color-overlay': 'rgba(23, 33, 29, 0.45)',
    '--shadow-card': '0 1px 2px rgba(23, 33, 29, 0.06), 0 4px 16px rgba(23, 33, 29, 0.05)',
    '--color-divider': '#dde1dc',
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
