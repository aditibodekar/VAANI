import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('vani-theme');
    if (saved) return saved === 'dark';
    return true; // default to modern dark mode
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      localStorage.setItem('vani-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      localStorage.setItem('vani-theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        darkMode,
        toggleTheme,
        dark: darkMode,
        setDark: setDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

