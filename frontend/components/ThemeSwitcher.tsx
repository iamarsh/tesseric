"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface ThemeSwitcherProps {
  variant?: "inline" | "fixed";
}

export function ThemeSwitcher({ variant = "inline" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const baseClasses = "p-2 rounded-lg bg-card border border-border hover:bg-accent transition-all duration-200";
  const variantClasses = variant === "fixed"
    ? "fixed top-6 right-6 shadow-lg hover:shadow-xl z-50 p-3"
    : "";

  return (
    <button
      onClick={toggleTheme}
      className={`${baseClasses} ${variantClasses}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-amber-500" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
    </button>
  );
}
