/**
 * Wordle game logic — operates on phoneme UNIT arrays, never alphabet letters.
 * UI components and HTML generators should call these helpers (no duplicated scoring).
 */

export function scorePhonemeGuess(guess, target) {
  const length = target.length;
  const result = Array(length).fill("absent");
  const remaining = {};

  for (let i = 0; i < length; i++) {
    if (guess[i] === target[i]) {
      result[i] = "correct";
    } else {
      remaining[target[i]] = (remaining[target[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < length; i++) {
    if (result[i] === "correct") continue;
    const unit = guess[i];
    if (remaining[unit] > 0) {
      result[i] = "present";
      remaining[unit] -= 1;
    }
  }

  return result;
}

export function isCompleteGuess(guess, length) {
  return Array.isArray(guess) && guess.length === length && guess.every(Boolean);
}

const STATUS_RANK = { correct: 3, present: 2, absent: 1 };

/** Prefer stronger keyboard colour: correct > present > absent */
export function rankKeyStatus(next, previous) {
  return (STATUS_RANK[next] || 0) >= (STATUS_RANK[previous] || 0)
    ? next
    : previous;
}

export function mergeKeyboardStatus(prevState, units, result) {
  const next = { ...prevState };
  units.forEach((unit, i) => {
    next[unit] = rankKeyStatus(result[i], next[unit]);
  });
  return next;
}

/**
 * Build win/lose/continue messaging.
 * Brief requires a clear English equivalence when the answer is correct.
 */
export function evaluateGuessOutcome(
  result,
  guessCount,
  maxGuesses,
  target,
  englishWord = ""
) {
  const phonemeDisplay = target.join(" ");
  const english = (englishWord || "").trim();

  if (result.every((status) => status === "correct")) {
    return {
      gameOver: true,
      won: true,
      message: english
        ? `Correct! English word: ${english}. Phonemes: ${phonemeDisplay}.`
        : `Correct! Phonemes: ${phonemeDisplay}.`,
    };
  }

  if (guessCount >= maxGuesses) {
    return {
      gameOver: true,
      won: false,
      message: english
        ? `Out of guesses. Answer — English: ${english}. Phonemes: ${phonemeDisplay}.`
        : `Out of guesses. Answer — Phonemes: ${phonemeDisplay}.`,
    };
  }

  return {
    gameOver: false,
    won: false,
    message: `Guess ${guessCount} of ${maxGuesses}`,
  };
}

export function validateWordleConfig(targetPhonemes, maxGuesses) {
  if (!targetPhonemes || targetPhonemes.length < 2) {
    return {
      ok: false,
      error: "Choose a target word with at least 2 phonemes.",
    };
  }
  if (maxGuesses < 3 || maxGuesses > 10) {
    return {
      ok: false,
      error: "Number of guesses must be between 3 and 10.",
    };
  }
  return { ok: true };
}

/**
 * Validate a multi-word Wordle pack.
 * @param {{ phonemes: string[], english?: string }[]} targets
 */
export function validateWordlePack(targets, maxGuesses) {
  if (!targets || targets.length === 0) {
    return { ok: false, error: "Add at least one target word to the pack." };
  }
  if (targets.length > 12) {
    return { ok: false, error: "Use 12 target words or fewer." };
  }
  if (maxGuesses < 3 || maxGuesses > 10) {
    return {
      ok: false,
      error: "Number of guesses must be between 3 and 10.",
    };
  }
  const boxCount = targets[0]?.phonemes?.length;
  if (!boxCount || boxCount < 2) {
    return { ok: false, error: "Each word needs at least 2 phoneme boxes." };
  }
  // Pack size (word count) must match box count (phonemes per word).
  if (targets.length !== boxCount) {
    return {
      ok: false,
      error: `Pack needs ${boxCount} words to match the ${boxCount} phoneme boxes (currently ${targets.length}).`,
    };
  }
  for (let i = 0; i < targets.length; i++) {
    const units = targets[i]?.phonemes;
    if (!units || units.length !== boxCount) {
      return {
        ok: false,
        error: `Word ${i + 1} must have exactly ${boxCount} phoneme boxes.`,
      };
    }
  }
  return { ok: true };
}

/** Normalize single-target or pack into a pack array. */
export function normalizeWordleTargets(config = {}) {
  if (Array.isArray(config.targets) && config.targets.length > 0) {
    return config.targets.map((t) => ({
      phonemes: [...t.phonemes],
      english: (t.english || "").trim(),
    }));
  }
  if (config.targetPhonemes?.length) {
    return [
      {
        phonemes: [...config.targetPhonemes],
        english: (config.englishWord || "").trim(),
      },
    ];
  }
  return [];
}
