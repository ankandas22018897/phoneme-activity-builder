"use client";

import { useMemo, useState } from "react";
import GenerateButton from "./GenerateButton";
import PhonemeKeyboard from "./PhonemeKeyboard";
import WordleGame from "./WordleGame";
import { PHONEME_MAP } from "@/data/phonemes";
import { WORDLE_WORDS, findWordByPhonemes } from "@/data/phonemeWords";
import { downloadWordleActivity } from "@/lib/htmlGenerator";
import { validateWordlePack } from "@/lib/wordleLogic";

function pickRandomPack(count = 5, phonemeCount = 3) {
  const pool = WORDLE_WORDS.filter((w) => w.phonemeCount === phonemeCount);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((w) => ({
    phonemes: [...w.phonemes],
    english: w.word,
  }));
}

function draftFromEntry(entry) {
  return {
    phonemes: [...entry.phonemes],
    english: entry.word,
  };
}

/**
 * Teacher Wordle builder — multi-word target pack + live preview.
 */
export default function WordleBuilder() {
  /** Size N = N words in pack AND N phoneme boxes per word (3, 4, or 5). */
  const [size, setSize] = useState(3);
  const [targets, setTargets] = useState(() => pickRandomPack(3, 3));
  const [draft, setDraft] = useState(() => {
    const d = WORDLE_WORDS.find((w) => w.word === "ship") || WORDLE_WORDS[0];
    return { phonemes: [...d.phonemes], english: d.word };
  });
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [error, setError] = useState("");

  const matched = useMemo(
    () => findWordByPhonemes(draft.phonemes),
    [draft.phonemes]
  );
  const previewKey = useMemo(
    () =>
      `${targets.map((t) => t.phonemes.join(".")).join("|")}-${maxGuesses}-${hintsEnabled}`,
    [targets, maxGuesses, hintsEnabled]
  );

  function selectCorpusWord(wordEntry) {
    setDraft(draftFromEntry(wordEntry));
    setError("");
  }

  function addPhoneme(symbol) {
    setDraft((prev) => {
      if (prev.phonemes.length >= size) return prev;
      return {
        ...prev,
        phonemes: [...prev.phonemes, symbol],
      };
    });
    setError("");
  }

  function removeLast() {
    setDraft((prev) => ({
      ...prev,
      phonemes: prev.phonemes.slice(0, -1),
    }));
  }

  function clearDraft() {
    setDraft({ phonemes: [], english: "" });
  }

  function addDraftToPack() {
    if (draft.phonemes.length !== size) {
      setError(`Each word needs exactly ${size} phoneme boxes.`);
      return;
    }
    if (targets.length >= size) {
      setError(`Pack is full — ${size} words for ${size} boxes.`);
      return;
    }
    const key = draft.phonemes.join("|");
    if (targets.some((t) => t.phonemes.join("|") === key)) {
      setError("That word is already in the pack.");
      return;
    }
    setTargets((prev) => [
      ...prev,
      {
        phonemes: [...draft.phonemes],
        english: (draft.english || matched?.word || "").trim(),
      },
    ]);
    setError("");
  }

  function removeFromPack(index) {
    setTargets((prev) => prev.filter((_, i) => i !== index));
  }

  function applySize(nextSize) {
    const n = [3, 4, 5].includes(nextSize) ? nextSize : 3;
    setSize(n);
    const next = pickRandomPack(n, n);
    if (!next.length) {
      setError("No corpus words for that size.");
      setTargets([]);
      return;
    }
    setTargets(next);
    setDraft({ phonemes: [], english: "" });
    setError("");
  }

  function randomizePack() {
    applySize(size);
  }

  function handleGenerate() {
    const validation = validateWordlePack(targets, maxGuesses);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    const phonemeHints = Object.fromEntries(
      Object.values(PHONEME_MAP).map((p) => [p.symbol, p.hint])
    );
    downloadWordleActivity({
      targets,
      targetPhonemes: targets[0].phonemes,
      englishWord: targets[0].english || "",
      maxGuesses,
      hintsEnabled,
      phonemeHints,
      title: "PHONEME'LE",
    });
    setError("");
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          {error ? (
            <p
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <p className="mb-1.5 text-sm font-semibold text-[var(--text)]">
            Target word pack ({targets.length}/{size})
          </p>
          <ul className="mb-3 max-h-40 space-y-1.5 overflow-y-auto rounded-md border border-[#e2e8f0] p-2 dark:border-[var(--border)]">
            {targets.length === 0 ? (
              <li className="px-1 py-2 text-sm text-[var(--text-muted)]">
                No words yet — randomize or add below.
              </li>
            ) : (
              targets.map((t, i) => (
                <li
                  key={`${t.phonemes.join("-")}-${i}`}
                  className="flex items-center justify-between gap-2 rounded-md bg-[#f8fafc] px-2 py-1.5 text-sm dark:bg-[var(--surface-muted)]"
                >
                  <span>
                    <span className="mr-1.5 font-semibold text-[#2b5c8f] dark:text-[var(--primary)]">
                      {i + 1}.
                    </span>
                    <span className="font-mono">{t.phonemes.join(" ")}</span>
                    {t.english ? (
                      <span className="text-[var(--text-muted)]">
                        {" "}
                        · {t.english}
                      </span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeFromPack(i)}
                    className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))
            )}
          </ul>

          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="pack-size" className="mb-1 block text-sm font-medium">
                Words &amp; boxes
              </label>
              <select
                id="pack-size"
                value={size}
                onChange={(e) => applySize(Number(e.target.value))}
                className="w-full rounded-md border border-[#cbd5e1] px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
              >
                <option value={3}>3 words · 3 boxes</option>
                <option value={4}>4 words · 4 boxes</option>
                <option value={5}>5 words · 5 boxes</option>
              </select>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Word count matches phoneme boxes per row.
              </p>
            </div>
            <div>
              <label htmlFor="guesses" className="mb-1 block text-sm font-medium">
                Guess rows
              </label>
              <input
                id="guesses"
                type="number"
                min={3}
                max={10}
                value={maxGuesses}
                onChange={(e) => setMaxGuesses(Number(e.target.value) || 6)}
                className="w-full rounded-md border border-[#cbd5e1] px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={randomizePack}
            className="mb-4 w-full rounded-md bg-[#0f766e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0d9488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            Randomize word pack
          </button>

          <label
            htmlFor="corpus-word"
            className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
          >
            Add a target word ({size} boxes)
          </label>
          <select
            id="corpus-word"
            className="mb-3 w-full rounded-md border border-[#cbd5e1] bg-white px-3 py-2.5 text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
            value={matched?.word || ""}
            onChange={(e) => {
              const found = WORDLE_WORDS.find((w) => w.word === e.target.value);
              if (found) selectCorpusWord(found);
            }}
          >
            <option value="">Custom (build with keyboard)</option>
            {WORDLE_WORDS.filter((w) => w.phonemeCount === size).map((w) => (
              <option key={`${w.word}-${w.phonemes.join("-")}`} value={w.word}>
                {w.word} — {w.phonemes.join(" ")}
              </option>
            ))}
          </select>

          <label
            htmlFor="english-word"
            className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
          >
            English label
          </label>
          <input
            id="english-word"
            type="text"
            value={draft.english}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, english: e.target.value }))
            }
            className="mb-3 w-full rounded-md border border-[#cbd5e1] px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
            placeholder="Shown after a correct answer"
          />

          <p className="mb-1.5 text-sm font-semibold text-[var(--text)]">
            Draft phonemes
          </p>
          <div
            className="mb-2 flex min-h-12 flex-wrap items-center gap-1.5 rounded-md border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-3 py-2 dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
            aria-live="polite"
          >
            {draft.phonemes.length === 0 ? (
              <span className="text-sm text-[var(--text-muted)]">
                Select a word or tap phonemes below
              </span>
            ) : (
              draft.phonemes.map((p, i) => (
                <span
                  key={`${p}-${i}`}
                  className="rounded-md border border-[#2b5c8f] bg-[#e8f1f8] px-2 py-1 font-semibold text-[#1d4f7c] dark:border-[var(--primary)] dark:bg-[var(--primary-soft)] dark:text-[var(--primary)]"
                >
                  {p}
                </span>
              ))
            )}
          </div>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={removeLast}
              className="flex-1 rounded-md border border-[#cbd5e1] px-3 py-2 text-sm font-semibold hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)]"
            >
              Remove last
            </button>
            <button
              type="button"
              onClick={clearDraft}
              className="flex-1 rounded-md border border-[#cbd5e1] px-3 py-2 text-sm font-semibold hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)]"
            >
              Clear
            </button>
          </div>
          <button
            type="button"
            onClick={addDraftToPack}
            className="mb-3 w-full rounded-md border border-[#2b5c8f] bg-white px-4 py-2.5 text-sm font-semibold text-[#2b5c8f] hover:bg-[#eff6ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)] dark:text-[var(--text)]"
          >
            Add to pack
          </button>

          <div className="mb-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={(e) => setHintsEnabled(e.target.checked)}
                className="h-4 w-4 accent-[#2b5c8f]"
              />
              Phoneme hints
            </label>
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Build draft word
          </p>
          <div className="mb-3 max-h-44 overflow-y-auto rounded-md border border-[#e2e8f0] p-2 dark:border-[var(--border)]">
            <PhonemeKeyboard
              onSelect={addPhoneme}
              showSections={false}
              showHints={hintsEnabled}
            />
          </div>

          <GenerateButton
            onClick={handleGenerate}
            label="Generate HTML"
            className="w-full rounded-md bg-[#2b5c8f] py-3 text-base hover:bg-[#1e4366]"
          />
        </section>

        <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          {targets.length > 0 ? (
            <WordleGame
              key={previewKey}
              targets={targets}
              maxGuesses={maxGuesses}
              hintsEnabled={hintsEnabled}
            />
          ) : (
            <p className="text-[var(--text-muted)]">
              Add target words to the pack to preview the multi-word game.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
