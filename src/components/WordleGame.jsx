"use client";

import { useEffect, useMemo, useState } from "react";
import PhonemeHint from "./PhonemeHint";
import PhonemeKeyboard from "./PhonemeKeyboard";
import {
  evaluateGuessOutcome,
  isCompleteGuess,
  mergeKeyboardStatus,
  normalizeWordleTargets,
  scorePhonemeGuess,
} from "@/lib/wordleLogic";

const STATUS_STYLES = {
  correct:
    "border-[var(--correct)] bg-[var(--correct-bg)] text-[var(--correct)]",
  present:
    "border-[var(--present)] bg-[var(--present-bg)] text-[var(--present)]",
  absent: "border-[var(--absent)] bg-[var(--absent-bg)] text-[var(--absent)]",
  empty:
    "border-[#cbd5e1] bg-white text-[var(--text)] dark:border-[var(--border)] dark:bg-[var(--surface)]",
  filled:
    "border-slate-500 bg-white text-[var(--text)] dark:border-slate-400 dark:bg-[var(--surface)]",
};

/**
 * Playable multi-word Phoneme Wordle.
 * Supports `targets` pack or legacy single `targetPhonemes`.
 */
export default function WordleGame({
  targets: targetsProp,
  targetPhonemes,
  maxGuesses = 6,
  hintsEnabled = true,
  englishWord = "",
  showEnglishWhilePlaying = false,
}) {
  const pack = useMemo(
    () =>
      normalizeWordleTargets({
        targets: targetsProp,
        targetPhonemes,
        englishWord,
      }),
    [targetsProp, targetPhonemes, englishWord]
  );

  const [roundIndex, setRoundIndex] = useState(0);
  const [wins, setWins] = useState(0);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState([]);
  const [keyState, setKeyState] = useState({});
  const [message, setMessage] = useState("Enter phonemes, then press ENTER.");
  const [hintSymbol, setHintSymbol] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [packComplete, setPackComplete] = useState(false);

  const currentTarget = pack[roundIndex] || pack[0];
  const targetUnits = currentTarget?.phonemes || [];
  const english = currentTarget?.english || "";
  const length = targetUnits.length;
  const totalWords = pack.length;
  const isLastWord = roundIndex >= totalWords - 1;

  const rows = useMemo(() => {
    const list = [];
    for (let i = 0; i < maxGuesses; i++) {
      if (guesses[i]) list.push(guesses[i]);
      else if (i === guesses.length) {
        list.push({ units: current, result: null, draft: true });
      } else {
        list.push({ units: [], result: null, draft: false });
      }
    }
    return list;
  }, [current, guesses, maxGuesses]);

  function clearRoundState(nextMessage) {
    setGuesses([]);
    setCurrent([]);
    setKeyState({});
    setGameOver(false);
    setWon(false);
    setShowEndModal(false);
    setHintSymbol("");
    setMessage(nextMessage || "Enter phonemes, then press ENTER.");
  }

  function addPhoneme(symbol) {
    if (gameOver || current.length >= length) return;
    setCurrent((prev) => {
      const next = [...prev, symbol];
      if (next.length >= length) {
        setMessage("Row full — press ENTER to check this guess.");
      } else {
        setMessage("");
      }
      return next;
    });
  }

  function deleteLast() {
    if (gameOver) return;
    setCurrent((prev) => {
      const next = prev.slice(0, -1);
      setMessage(
        next.length === 0 ? "Enter phonemes, then press ENTER." : ""
      );
      return next;
    });
  }

  function restartPack() {
    setRoundIndex(0);
    setWins(0);
    setPackComplete(false);
    clearRoundState("New pack — enter phonemes, then press ENTER.");
  }

  function goToNextWord() {
    if (isLastWord) {
      setPackComplete(true);
      setShowEndModal(true);
      return;
    }
    const next = roundIndex + 1;
    setRoundIndex(next);
    clearRoundState(
      `Word ${next + 1} of ${totalWords} — enter phonemes, then press ENTER.`
    );
  }

  function submitGuess() {
    if (gameOver || !length) return;
    if (!isCompleteGuess(current, length)) {
      setMessage(`Enter ${length} phonemes before pressing ENTER.`);
      return;
    }
    const result = scorePhonemeGuess(current, targetUnits);
    const nextGuesses = [...guesses, { units: current, result, draft: false }];
    setGuesses(nextGuesses);
    setKeyState((prev) => mergeKeyboardStatus(prev, current, result));

    const outcome = evaluateGuessOutcome(
      result,
      nextGuesses.length,
      maxGuesses,
      targetUnits,
      english
    );
    setGameOver(outcome.gameOver);
    setWon(Boolean(outcome.won));
    setMessage(outcome.message);
    setCurrent([]);
    if (outcome.gameOver) {
      if (outcome.won) setWins((w) => w + 1);
      setShowEndModal(true);
      if (isLastWord && outcome.gameOver) {
        // Final modal will show after this round result; mark pack done on continue
      }
    }
  }

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitGuess();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        deleteLast();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gameOver,
    current,
    guesses,
    length,
    english,
    maxGuesses,
    targetUnits,
    roundIndex,
  ]);

  if (!currentTarget) {
    return (
      <p className="text-[var(--text-muted)]">No target words in this pack.</p>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-stretch gap-4">
      <header className="text-center">
        <h2 className="text-2xl font-bold tracking-wide text-[#2b5c8f] dark:text-[var(--primary)]">
          PHONEME&apos;LE
        </h2>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">
          Word {roundIndex + 1} of {totalWords}
          <span className="font-normal text-[var(--text-muted)]">
            {" "}
            · {length} phonemes · Solved {wins}
          </span>
        </p>
        <p className="mt-0.5 text-sm text-[var(--text-muted)]">
          Guess the phoneme word
          {showEnglishWhilePlaying && english
            ? ` · Teacher label: ${english}`
            : ""}
        </p>
        <div
          className="mx-auto mt-3 flex max-w-xs justify-center gap-1"
          aria-hidden="true"
        >
          {pack.map((_, i) => (
            <span
              key={`dot-${i}`}
              className={`h-2 flex-1 rounded-full ${
                i < roundIndex
                  ? "bg-green-500"
                  : i === roundIndex
                    ? "bg-[#2b5c8f] dark:bg-[var(--primary)]"
                    : "bg-[#e2e8f0] dark:bg-[var(--border)]"
              }`}
            />
          ))}
        </div>
      </header>

      <div className="flex flex-wrap justify-center gap-3 text-xs text-[var(--text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border border-[var(--correct)] bg-[var(--correct-bg)]" />
          Correct
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border border-[var(--present)] bg-[var(--present-bg)]" />
          Wrong place
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-3.5 w-3.5 rounded-sm border border-[var(--absent)] bg-[var(--absent-bg)]" />
          Absent
        </span>
      </div>

      <div
        className="flex flex-col items-center gap-1.5"
        role="group"
        aria-label="Wordle guess grid"
      >
        {rows.map((row, rowIndex) => {
          const isActive = !gameOver && rowIndex === guesses.length;
          return (
            <div
              key={`row-${roundIndex}-${rowIndex}`}
              className={`flex justify-center gap-1.5 rounded-lg p-0.5 transition ${
                isActive
                  ? "ring-2 ring-[#2b5c8f] ring-offset-2 dark:ring-[var(--primary)]"
                  : ""
              } ${!isActive && !row.result ? "opacity-45" : ""}`}
              aria-current={isActive ? "step" : undefined}
            >
              {Array.from({ length }).map((_, colIndex) => {
                const unit = row.units[colIndex];
                const status = row.result?.[colIndex];
                let style = STATUS_STYLES.empty;
                if (status) style = STATUS_STYLES[status];
                else if (unit) style = STATUS_STYLES.filled;
                return (
                  <div
                    key={`c-${rowIndex}-${colIndex}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-md border-2 text-base font-bold sm:h-12 sm:w-12 sm:text-lg ${style}`}
                    aria-label={
                      unit
                        ? `${unit}${status ? `, ${status}` : ""}`
                        : isActive
                          ? "empty cell, active row"
                          : "empty cell"
                    }
                  >
                    {unit || ""}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <p
        className="min-h-6 text-center text-sm font-semibold text-[var(--text)]"
        role="status"
        aria-live="polite"
      >
        {message}
      </p>
      <p className="text-center text-xs text-[var(--text-muted)]">
        Fill the highlighted row, then press <strong>ENTER</strong>. Finish each
        word to unlock the next target.
      </p>

      {hintsEnabled ? (
        <p
          className="min-h-5 text-center text-sm text-[var(--text-muted)]"
          aria-live="polite"
        >
          {hintSymbol ? <PhonemeHint symbol={hintSymbol} /> : null}
        </p>
      ) : null}

      <div className="flex justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (!gameOver) setCurrent([]);
          }}
          className="rounded-md border border-[#cbd5e1] px-4 py-2 text-sm font-semibold hover:bg-[#f1f5f9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] dark:border-[var(--border)]"
        >
          Clear row
        </button>
        <button
          type="button"
          onClick={restartPack}
          className="rounded-md bg-[#64748b] px-4 py-2 text-sm font-semibold text-white hover:bg-[#475569] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          Restart pack
        </button>
      </div>

      <PhonemeKeyboard
        onSelect={(symbol) => {
          if (hintsEnabled) setHintSymbol(symbol);
          else setHintSymbol("");
          addPhoneme(symbol);
        }}
        disabled={gameOver}
        showHints={hintsEnabled}
        showSections={false}
        statusMap={keyState}
        showActions
        onEnter={submitGuess}
        onDelete={deleteLast}
      />

      {showEndModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wordle-end-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-white p-6 text-center shadow-xl dark:bg-[var(--surface)]">
            {packComplete || (isLastWord && gameOver) ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-300">
                  Pack complete
                </p>
                <h3
                  id="wordle-end-title"
                  className="mt-2 text-2xl font-bold text-[var(--text)]"
                >
                  Congratulations!
                </h3>
                <p className="mt-3 text-[var(--text)]">
                  You finished all {totalWords} words
                  {english ? (
                    <>
                      . Last word: <strong>{english}</strong>
                    </>
                  ) : (
                    "."
                  )}
                </p>
                <p className="mt-1 text-[var(--text-muted)]">
                  Solved {wins} of {totalWords}
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Phonemes: {targetUnits.join(" | ")}
                </p>
                <button
                  type="button"
                  onClick={restartPack}
                  className="mt-5 rounded-lg bg-[#2b5c8f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e4366] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                >
                  New Game
                </button>
              </>
            ) : (
              <>
                <p
                  className={`text-sm font-semibold uppercase tracking-wide ${
                    won
                      ? "text-green-700 dark:text-green-300"
                      : "text-amber-700 dark:text-amber-300"
                  }`}
                >
                  {won ? "Answer correct" : "Out of guesses"}
                </p>
                <h3
                  id="wordle-end-title"
                  className="mt-2 text-2xl font-bold text-[var(--text)]"
                >
                  {won ? "Nice!" : "Onto the next"}
                </h3>
                <p className="mt-3 text-lg font-bold text-[var(--text)]">
                  {english
                    ? `English word: ${english}`
                    : "English equivalence unavailable"}
                </p>
                <p className="mt-1 text-[var(--text-muted)]">
                  Phonemes: {targetUnits.join(" | ")}
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Word {roundIndex + 1} of {totalWords} done · Solved {wins}
                </p>
                <button
                  type="button"
                  onClick={goToNextWord}
                  className="mt-5 rounded-lg bg-[#2b5c8f] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1e4366] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
                >
                  Next word
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
