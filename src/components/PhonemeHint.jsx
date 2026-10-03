"use client";

import { getPhonemeHint } from "@/data/phonemes";

/**
 * Reusable phoneme hint text for hover/focus and live regions.
 * Communicates meaning with text, not colour alone.
 */
export default function PhonemeHint({
  symbol,
  className = "",
  asTooltip = false,
}) {
  const hint = getPhonemeHint(symbol);
  if (!hint) return null;

  if (asTooltip) {
    return (
      <span
        role="tooltip"
        className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[12rem] -translate-x-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-medium text-[var(--text)] shadow-md ${className}`}
      >
        {hint}
      </span>
    );
  }

  return (
    <span className={`text-sm text-[var(--text-muted)] ${className}`}>
      {hint}
    </span>
  );
}

export { getPhonemeHint };
