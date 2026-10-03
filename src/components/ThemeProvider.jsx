"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  DENSITIES,
  DENSITY_COOKIE,
  THEME_COOKIE,
  THEMES,
  parseDensity,
  parseTheme,
  setClientCookie,
} from "@/lib/theme";

const ThemeContext = createContext({
  theme: THEMES.light,
  density: DENSITIES.comfortable,
  setTheme: () => {},
  setDensity: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ initialTheme, initialDensity, children }) {
  const [theme, setThemeState] = useState(parseTheme(initialTheme));
  const [density, setDensityState] = useState(parseDensity(initialDensity));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === THEMES.dark);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);

  const setTheme = useCallback((next) => {
    const value = parseTheme(next);
    setThemeState(value);
    setClientCookie(THEME_COOKIE, value);
  }, []);

  const setDensity = useCallback((next) => {
    const value = parseDensity(next);
    setDensityState(value);
    setClientCookie(DENSITY_COOKIE, value);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEMES.dark ? THEMES.light : THEMES.dark);
  }, [setTheme, theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, density, setTheme, setDensity, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeSettings() {
  return useContext(ThemeContext);
}
