"use client";

import PageHeader from "@/components/PageHeader";
import { useThemeSettings } from "@/components/ThemeProvider";
import { DENSITIES, THEMES } from "@/lib/theme";

export default function SettingsPage() {
  const { theme, density, setTheme, setDensity } = useThemeSettings();

  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="Settings"
        description="Choose appearance preferences for the application."
      />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Colour mode</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Light and dark themes apply across the whole application.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setTheme(THEMES.light)}
            aria-pressed={theme === THEMES.light}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
              theme === THEMES.light
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)]"
            }`}
          >
            Light mode
          </button>
          <button
            type="button"
            onClick={() => setTheme(THEMES.dark)}
            aria-pressed={theme === THEMES.dark}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
              theme === THEMES.dark
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)]"
            }`}
          >
            Dark mode
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Layout density</h2>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Compact reduces page padding; comfortable is the default spacing.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setDensity(DENSITIES.comfortable)}
            aria-pressed={density === DENSITIES.comfortable}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
              density === DENSITIES.comfortable
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)]"
            }`}
          >
            Comfortable
          </button>
          <button
            type="button"
            onClick={() => setDensity(DENSITIES.compact)}
            aria-pressed={density === DENSITIES.compact}
            className={`rounded-lg border px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
              density === DENSITIES.compact
                ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                : "border-[var(--border)]"
            }`}
          >
            Compact
          </button>
        </div>
      </section>
    </div>
  );
}
