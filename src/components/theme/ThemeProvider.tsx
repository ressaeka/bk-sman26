"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setCurrentTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("bk26_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        return savedTheme;
      }
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    root.style.colorScheme = theme;
    localStorage.setItem("bk26_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setCurrentTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setCurrentTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
