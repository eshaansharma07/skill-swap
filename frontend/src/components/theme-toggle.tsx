"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle visual theme"
      className="relative p-2 rounded-full text-muted-light dark:text-muted-dark hover:text-foreground-light dark:hover:text-foreground-dark hover:bg-black/5 dark:hover:bg-white/10 transition-colors duration-200"
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 transition-transform duration-200 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
      )}
    </button>
  );
}
