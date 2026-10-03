"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCellPath,
  matchSelectionToWord,
} from "@/lib/wordSearchLogic";

function cellFromElement(el) {
  if (!el?.dataset?.row) return null;
  return {
    r: Number(el.dataset.row),
    c: Number(el.dataset.col),
  };
}

function cellAtPoint(x, y) {
  return cellFromElement(document.elementFromPoint(x, y));
}

function WordSearchGrid({
  rows,
  cols,
  grid,
  highlightSet,
  foundCoordSet,
  answerCoordSet,
  flashSet,
  flashType,
  onCellMouseDown,
  onCellTouchStart,
}) {
  return (
    <div
      className="mx-auto grid w-max max-w-full touch-none select-none gap-0.5 overflow-auto rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm dark:bg-[var(--surface)]"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      role="grid"
      aria-label="Word search grid"
    >
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((__, c) => {
          const key = `${r}-${c}`;
          const isHi = highlightSet.has(key);
          const isFound = foundCoordSet.has(key);
          const isAnswer = answerCoordSet.has(key);
          const isFlash = flashSet.has(key);
          let cellClass =
            "border-[#e2e8f0] bg-[#f8fafc] text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--surface-muted)]";
          if (isFlash && flashType === "correct") {
            cellClass =
              "border-green-600 bg-[#86efac] text-[#14532d] dark:bg-green-700 dark:text-green-50";
          } else if (isFlash && flashType === "wrong") {
            cellClass =
              "border-red-600 bg-[#fecaca] text-[#7f1d1d] dark:bg-red-900 dark:text-red-100";
          } else if (isFound) {
            cellClass =
              "border-green-500 bg-[#bbf7d0] text-[#166534] dark:bg-green-900 dark:text-green-100";
          } else if (isHi) {
            cellClass = "border-amber-400 bg-[#fef08a] text-amber-950";
          } else if (isAnswer) {
            cellClass = "border-pink-300 bg-[#fbcfe8] text-pink-950";
          }
          return (
            <div
              key={key}
              role="gridcell"
              data-row={r}
              data-col={c}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center border text-[1.05rem] font-bold transition-colors sm:h-10 sm:w-10 ${cellClass}`}
              onMouseDown={(e) => onCellMouseDown(e, r, c)}
              onTouchStart={(e) => onCellTouchStart(e, r, c)}
            >
              {grid[r][c]}
            </div>
          );
        })
      )}
    </div>
  );
}

/**
 * Playable Word Search:
 * - correct selection → green
 * - incorrect selection → red flash
 * - all words found → congratulations popup + New Game
 */
export default function WordSearchGame({
  grid,
  rows,
  cols,
  words,
  solutions,
  showAnswers = false,
  showToolbar = true,
  onShowAnswersChange,
  onNewGame,
}) {
  const [foundKeys, setFoundKeys] = useState([]);
  const [internalShowAnswers, setInternalShowAnswers] = useState(false);
  const [highlight, setHighlight] = useState([]);
  const [flashPath, setFlashPath] = useState([]);
  const [flashType, setFlashType] = useState(null); // "correct" | "wrong"
  const [statusMessage, setStatusMessage] = useState("");
  const [showWinModal, setShowWinModal] = useState(false);

  const selectingRef = useRef(false);
  const startRef = useRef(null);
  const highlightRef = useRef([]);
  const foundKeysRef = useRef([]);
  const gridRef = useRef(grid);
  const wordsRef = useRef(words);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    foundKeysRef.current = foundKeys;
  }, [foundKeys]);

  useEffect(() => {
    gridRef.current = grid;
    wordsRef.current = words;
  }, [grid, words]);

  useEffect(() => {
    return () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const answersVisible =
    typeof onShowAnswersChange === "function" ? showAnswers : internalShowAnswers;

  const setAnswersVisible = useCallback(
    (next) => {
      if (typeof onShowAnswersChange === "function") {
        onShowAnswersChange(next);
      } else {
        setInternalShowAnswers(next);
      }
    },
    [onShowAnswersChange]
  );

  const clearFlashSoon = useCallback((delayMs = 450) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => {
      setFlashPath([]);
      setFlashType(null);
    }, delayMs);
  }, []);

  const beginSelect = useCallback((cell) => {
    if (!cell || Number.isNaN(cell.r) || Number.isNaN(cell.c)) return;
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setFlashPath([]);
    setFlashType(null);
    setStatusMessage("");
    selectingRef.current = true;
    startRef.current = cell;
    highlightRef.current = [cell];
    setHighlight([cell]);
  }, []);

  const moveSelect = useCallback((cell) => {
    if (!selectingRef.current || !startRef.current || !cell) return;
    if (Number.isNaN(cell.r) || Number.isNaN(cell.c)) return;
    const path = getCellPath(
      startRef.current.r,
      startRef.current.c,
      cell.r,
      cell.c
    );
    if (!path) return;
    highlightRef.current = path;
    setHighlight(path);
  }, []);

  const endSelect = useCallback(() => {
    if (!selectingRef.current) return;
    selectingRef.current = false;
    const path = highlightRef.current;
    startRef.current = null;
    highlightRef.current = [];
    setHighlight([]);

    if (!path?.length) return;

    // Ignore tiny accidental clicks
    if (path.length < 2) {
      setStatusMessage("Drag across at least 2 phonemes to select a word.");
      return;
    }

    const match = matchSelectionToWord(
      gridRef.current,
      path,
      wordsRef.current,
      foundKeysRef.current
    );

    if (match) {
      setFlashType("correct");
      setFlashPath(path);
      setStatusMessage(`Correct: ${match.display}`);
      setFoundKeys((prev) => {
        const next = prev.includes(match.key) ? prev : [...prev, match.key];
        if (next.length >= wordsRef.current.length) {
          setTimeout(() => setShowWinModal(true), 500);
        }
        return next;
      });
      clearFlashSoon(500);
    } else {
      setFlashType("wrong");
      setFlashPath(path);
      setStatusMessage("Incorrect — try again.");
      clearFlashSoon(550);
    }
  }, [clearFlashSoon]);

  useEffect(() => {
    const onUp = () => endSelect();
    const onMove = (e) => {
      if (!selectingRef.current) return;
      moveSelect(cellAtPoint(e.clientX, e.clientY));
    };
    const onTouchMove = (e) => {
      if (!selectingRef.current) return;
      const t = e.touches[0];
      if (!t) return;
      const cell = cellAtPoint(t.clientX, t.clientY);
      if (cell) {
        e.preventDefault();
        moveSelect(cell);
      }
    };

    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchend", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchend", onUp);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [endSelect, moveSelect]);

  function handleNewGame() {
    setShowWinModal(false);
    setFoundKeys([]);
    setStatusMessage("");
    setFlashPath([]);
    setFlashType(null);
    setAnswersVisible(false);
    if (typeof onNewGame === "function") {
      onNewGame();
    }
  }

  const foundCoordSet = new Set();
  words.forEach((w) => {
    if (!foundKeys.includes(w.key)) return;
    const sol = solutions.find((s) => s.key === w.key);
    sol?.coords.forEach((co) => foundCoordSet.add(`${co.r}-${co.c}`));
  });

  const answerCoordSet = new Set();
  if (answersVisible) {
    solutions.forEach((s) => {
      s.coords.forEach((co) => answerCoordSet.add(`${co.r}-${co.c}`));
    });
  }

  const highlightSet = new Set(
    highlight.map((c) => `${Math.round(c.r)}-${Math.round(c.c)}`)
  );
  const flashSet = new Set(
    flashPath.map((c) => `${Math.round(c.r)}-${Math.round(c.c)}`)
  );

  function onCellMouseDown(e, r, c) {
    e.preventDefault();
    beginSelect({ r, c });
  }

  function onCellTouchStart(e, r, c) {
    const t = e.touches[0];
    beginSelect(cellAtPoint(t.clientX, t.clientY) || { r, c });
  }

  return (
    <div className="relative flex w-full flex-col items-center">
      <p
        className="mb-1 w-full font-semibold text-[var(--text)]"
        role="status"
        aria-live="polite"
      >
        {foundKeys.length} of {words.length} words found
      </p>
      <p
        className={`mb-3 min-h-5 w-full text-sm font-medium ${
          flashType === "wrong"
            ? "text-red-700 dark:text-red-300"
            : flashType === "correct"
              ? "text-green-700 dark:text-green-300"
              : "text-[var(--text-muted)]"
        }`}
        role="status"
        aria-live="polite"
      >
        {statusMessage || "Drag in a straight line to select a word."}
      </p>

      <WordSearchGrid
        rows={rows}
        cols={cols}
        grid={grid}
        highlightSet={highlightSet}
        foundCoordSet={foundCoordSet}
        answerCoordSet={answerCoordSet}
        flashSet={flashSet}
        flashType={flashType}
        onCellMouseDown={onCellMouseDown}
        onCellTouchStart={onCellTouchStart}
      />

      <div className="mt-5 w-full rounded-xl border border-[#e2e8f0] bg-white p-4 shadow-sm dark:border-[var(--border)] dark:bg-[var(--surface)]">
        <h3 className="font-bold text-[var(--text)]">Word List:</h3>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {words.map((w) => {
            const found = foundKeys.includes(w.key);
            return (
              <li
                key={w.key}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  found
                    ? "bg-[#bbf7d0] text-[#166534] line-through"
                    : "bg-[#f1f5f9] text-[var(--text)] dark:bg-[var(--surface-muted)]"
                }`}
              >
                {w.display}
              </li>
            );
          })}
        </ul>
      </div>

      {showToolbar ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAnswersVisible(!answersVisible)}
            className="rounded-lg bg-[#64748b] px-4 py-2 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            {answersVisible ? "Hide Answers" : "Show Answers"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFoundKeys([]);
              setAnswersVisible(false);
              setStatusMessage("");
              setShowWinModal(false);
            }}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
          >
            Reset found
          </button>
        </div>
      ) : null}

      {showWinModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="win-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-xl dark:bg-[var(--surface)]">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
              Puzzle complete
            </p>
            <h2 id="win-title" className="mt-2 text-2xl font-bold text-[var(--text)]">
              Congratulations!
            </h2>
            <p className="mt-2 text-[var(--text-muted)]">
              You found all {words.length} phoneme words.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={handleNewGame}
                className="rounded-lg bg-[#2b5c8f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e4366] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
