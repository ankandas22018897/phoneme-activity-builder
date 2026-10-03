"use client";

import { useThemeSettings } from "./ThemeProvider";
import { THEMES } from "@/lib/theme";

export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useThemeSettings();
  const isDark = theme === THEMES.dark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
        className ||
        "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-muted)]"
      }`}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span>{isDark ? "Light mode" : "Dark mode"}</span>
    </button>
  );
}
