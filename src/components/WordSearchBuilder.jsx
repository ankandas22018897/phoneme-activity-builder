"use client";

import { useMemo, useState } from "react";
import GenerateButton from "./GenerateButton";
import WordSearchGame from "./WordSearchGame";
import { parsePhonemeInput } from "@/data/phonemes";
import { downloadWordSearchActivity } from "@/lib/htmlGenerator";
import {
  buildWordSearchPuzzle,
  pickRandomWordsForGrid,
  toWordItems,
  wordCountForGrid,
} from "@/lib/wordSearchLogic";

function parseWordLines(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, error: "Add at least one phoneme word (one word per line)." };
  }

  const unitLists = [];
  for (const line of lines) {
    const parsed = parsePhonemeInput(line);
    if (!parsed.ok) {
      return { ok: false, error: parsed.error };
    }
    unitLists.push(parsed.phonemes);
  }

  return { ok: true, words: toWordItems(unitLists) };
}

function buildFromText(text, rows, cols) {
  const parsed = parseWordLines(text);
  if (!parsed.ok) return parsed;
  const built = buildWordSearchPuzzle(parsed.words, rows, cols);
  if (!built.ok) {
    return {
      ok: false,
      error: built.error,
      puzzle: built.puzzle || null,
      words: parsed.words,
    };
  }
  return { ok: true, puzzle: built.puzzle, words: parsed.words };
}

function buildRandomPuzzle(rows, cols) {
  const picked = pickRandomWordsForGrid(rows, cols);
  if (!picked.words.length) {
    return {
      ok: false,
      error: "No corpus words fit this grid size. Try a larger grid.",
      text: "",
    };
  }
  const built = buildWordSearchPuzzle(picked.words, rows, cols);
  if (!built.ok) {
    return {
      ok: false,
      error: built.error,
      puzzle: built.puzzle || null,
      text: picked.text,
      words: picked.words,
    };
  }
  return { ok: true, puzzle: built.puzzle, text: picked.text, words: picked.words };
}

function createStarterPuzzle() {
  const result = buildRandomPuzzle(10, 10);
  if (result.ok && result.puzzle) {
    return { text: result.text, puzzle: result.puzzle };
  }
  const picked = pickRandomWordsForGrid(10, 10);
  const fallback = buildFromText(picked.text, 10, 10);
  return {
    text: picked.text,
    puzzle: fallback.ok ? fallback.puzzle : null,
  };
}

/**
 * Teacher Word Search builder — reference-style layout:
 * left controls (textarea + rows/cols + buttons), right playable grid.
 */
export default function WordSearchBuilder() {
  const [starter] = useState(createStarterPuzzle);
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [error, setError] = useState("");
  const [showAnswers, setShowAnswers] = useState(false);
  const [wordText, setWordText] = useState(starter.text);
  const [puzzle, setPuzzle] = useState(starter.puzzle);

  const suggestedCount = useMemo(() => wordCountForGrid(rows, cols), [rows, cols]);
  const wordCount = useMemo(
    () =>
      wordText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean).length,
    [wordText]
  );

  function applyPuzzleResult(result) {
    if (result.text != null) setWordText(result.text);
    if (!result.ok) {
      setError(result.error);
      if (result.puzzle) setPuzzle(result.puzzle);
      return false;
    }
    setError("");
    setShowAnswers(false);
    setPuzzle(result.puzzle);
    return true;
  }

  /** Place a puzzle using the current word list (does not change the words). */
  function handleGeneratePuzzle() {
    const result = buildFromText(wordText, rows, cols);
    applyPuzzleResult(result);
  }

  /** Fresh random words for this grid size, then place a new puzzle. */
  function handleNewGame() {
    applyPuzzleResult(buildRandomPuzzle(rows, cols));
  }

  function handleRandomizeWordsOnly() {
    const picked = pickRandomWordsForGrid(rows, cols);
    if (!picked.words.length) {
      setError("No corpus words fit this grid size. Try a larger grid.");
      return;
    }
    setWordText(picked.text);
    setError("");
  }

  function handleToggleAnswers() {
    if (!puzzle) {
      setError("Generate a puzzle first.");
      return;
    }
    setShowAnswers((v) => !v);
  }

  function handleGenerateHtml() {
    const result = buildFromText(wordText, rows, cols);
    if (!result.ok || !result.puzzle) {
      setError(result.error || "Could not build puzzle for download.");
      return;
    }
    if (result.puzzle.solutions.length < result.puzzle.words.length) {
      setError(
        "Not all words were placed. Increase the grid size, then try again."
      );
      setPuzzle(result.puzzle);
      return;
    }
    setPuzzle(result.puzzle);
    setError("");
    downloadWordSearchActivity({
      ...result.puzzle,
      title: "Phoneme Word Search",
    });
  }

  return (
    <div className="mx-auto w-full max-w-[1000px]">
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        {/* Left controls — matches reference Word Search UI */}
        <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          {error ? (
            <p
              className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <label
            htmlFor="word-input"
            className="mb-1.5 block text-sm font-semibold text-[var(--text)]"
          >
            Words (Space-separated phonemes):
          </label>
          <textarea
            id="word-input"
            value={wordText}
            onChange={(e) => setWordText(e.target.value)}
            rows={10}
            spellCheck={false}
            className="mb-3 w-full resize-y rounded-md border border-[#cbd5e1] bg-white px-3 py-2 font-mono text-[0.95rem] text-[var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
            aria-describedby="word-help"
          />
          <p id="word-help" className="mb-3 text-xs text-[var(--text-muted)]">
            Use <strong>Randomize Words</strong> to fill the list (~{suggestedCount}{" "}
            for {rows}×{cols}), then <strong>Generate Puzzle</strong> to place
            those words. Currently {wordCount} word
            {wordCount === 1 ? "" : "s"}. Example: <code>tʃ ɪ n</code>.
          </p>

          <div className="mb-3 grid grid-cols-2 gap-2.5">
            <div>
              <label htmlFor="grid-rows" className="mb-1 block text-sm font-medium">
                Rows
              </label>
              <input
                id="grid-rows"
                type="number"
                min={5}
                max={20}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value) || 10)}
                className="w-full rounded-md border border-[#cbd5e1] px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
              />
            </div>
            <div>
              <label htmlFor="grid-cols" className="mb-1 block text-sm font-medium">
                Cols
              </label>
              <input
                id="grid-cols"
                type="number"
                min={5}
                max={20}
                value={cols}
                onChange={(e) => setCols(Number(e.target.value) || 10)}
                className="w-full rounded-md border border-[#cbd5e1] px-2 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeneratePuzzle}
            className="mb-2.5 w-full rounded-md bg-[#2b5c8f] px-4 py-3 text-base font-semibold text-white hover:bg-[#1e4366] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            Generate Puzzle
          </button>
          <button
            type="button"
            onClick={handleRandomizeWordsOnly}
            className="mb-2.5 w-full rounded-md bg-[#0f766e] px-4 py-3 text-base font-semibold text-white hover:bg-[#0d9488] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            Randomize Words
          </button>
          <button
            type="button"
            onClick={handleToggleAnswers}
            className="mb-2.5 w-full rounded-md bg-[#64748b] px-4 py-3 text-base font-semibold text-white hover:bg-[#475569] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            {showAnswers ? "Hide Answers" : "Show Answers"}
          </button>
          <GenerateButton
            onClick={handleGenerateHtml}
            label="Generate HTML"
            className="w-full"
          />
        </section>

        {/* Right playable puzzle */}
        <section className="rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
          {puzzle ? (
            <WordSearchGame
              key={`${puzzle.rows}x${puzzle.cols}-${puzzle.words
                .map((w) => w.key)
                .join("|")}-${puzzle.solutions
                .map((s) => s.coords.map((c) => `${c.r},${c.c}`).join(";"))
                .join("|")}`}
              grid={puzzle.grid}
              rows={puzzle.rows}
              cols={puzzle.cols}
              words={puzzle.words}
              solutions={puzzle.solutions}
              showAnswers={showAnswers}
              showToolbar={false}
              onShowAnswersChange={setShowAnswers}
              onNewGame={handleNewGame}
            />
          ) : (
            <p className="text-[var(--text-muted)]">
              Click Randomize Words, then Generate Puzzle.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
