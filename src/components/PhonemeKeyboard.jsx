"use client";

import { useState } from "react";
import PhonemeHint, { getPhonemeHint } from "./PhonemeHint";
import { KEYBOARD_ROWS } from "@/data/phonemes";

const STATUS_CLASS = {
  correct:
    "border-[var(--correct)] bg-[var(--correct-bg)] text-[var(--correct)]",
  present:
    "border-[var(--present)] bg-[var(--present-bg)] text-[var(--present)]",
  absent: "border-[var(--absent)] bg-[var(--absent-bg)] text-[var(--absent)]",
};

function KeyButton({
  symbol,
  onSelect,
  active,
  disabled,
  status,
  showHints = true,
}) {
  const hint = getPhonemeHint(symbol) || symbol;
  const accessibleName = showHints ? hint : `Phoneme ${symbol}`;
  const [showHint, setShowHint] = useState(false);
  const statusClass = status ? STATUS_CLASS[status] : "";

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        disabled={disabled}
        aria-label={accessibleName}
        aria-pressed={active}
        title={showHints ? hint : symbol}
        onClick={() => onSelect?.(symbol)}
        onMouseEnter={() => {
          if (showHints) setShowHint(true);
        }}
        onMouseLeave={() => setShowHint(false)}
        onFocus={() => {
          if (showHints) setShowHint(true);
        }}
        onBlur={() => setShowHint(false)}
        className={`min-h-10 min-w-10 rounded-lg border px-2 py-1.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-40 ${
          statusClass
            ? statusClass
            : active
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text)] hover:border-[var(--primary)]"
        }`}
      >
        {symbol}
      </button>
      {showHints && showHint ? <PhonemeHint symbol={symbol} asTooltip /> : null}
    </span>
  );
}

export default function PhonemeKeyboard({
  onSelect,
  selectedSymbol = null,
  disabled = false,
  showSections = true,
  showHints = true,
  statusMap = null,
  showActions = false,
  onEnter,
  onDelete,
}) {
  return (
    <div className="space-y-4" aria-label="Phoneme keyboard">
      {showSections ? (
        <p className="text-sm text-[var(--text-muted)]">
          {showHints
            ? "Hover or focus a key for an English tip (for example θ → TH as in thin). Multi-character symbols count as one phoneme."
            : "Multi-character symbols (for example tʃ, æɪ) count as one phoneme."}
        </p>
      ) : null}

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Consonants
        </h3>
        <div className="space-y-2">
          {KEYBOARD_ROWS.consonants.map((row) => (
            <div key={row.join("-")} className="flex flex-wrap gap-1.5">
              {row.map((symbol) => (
                <KeyButton
                  key={symbol}
                  symbol={symbol}
                  onSelect={onSelect}
                  active={selectedSymbol === symbol}
                  disabled={disabled}
                  status={statusMap?.[symbol]}
                  showHints={showHints}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Vowels
        </h3>
        <div className="space-y-2">
          {KEYBOARD_ROWS.vowels.map((row) => (
            <div key={row.join("-")} className="flex flex-wrap gap-1.5">
              {row.map((symbol) => (
                <KeyButton
                  key={symbol}
                  symbol={symbol}
                  onSelect={onSelect}
                  active={selectedSymbol === symbol}
                  disabled={disabled}
                  status={statusMap?.[symbol]}
                  showHints={showHints}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {showActions ? (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete?.()}
            className="min-h-11 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-40"
            aria-label="Delete last phoneme"
          >
            DEL
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onEnter?.()}
            className="min-h-11 min-w-[6.5rem] rounded-lg bg-[var(--primary)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:opacity-40"
            aria-label="Enter guess"
          >
            ENTER
          </button>
        </div>
      ) : null}
    </div>
  );
}
