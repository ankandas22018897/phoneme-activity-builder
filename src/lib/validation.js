export const ACTIVITY_TYPES = ["WORDLE", "WORD_SEARCH"];
export const DIFFICULTIES = ["easy", "medium", "hard"];

export function parsePhonemes(value) {
  if (Array.isArray(value)) return value.map((p) => String(p).trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value.split(/\s+/).map((p) => p.trim()).filter(Boolean);
}

export function validateWordInput(word) {
  const english = typeof word?.english === "string" ? word.english.trim() : "";
  const phonemes = parsePhonemes(word?.phonemes);
  if (!english) return { ok: false, error: "English word is required." };
  if (!/^[A-Za-z][A-Za-z' -]*$/.test(english)) {
    return { ok: false, error: "English word contains invalid characters." };
  }
  if (phonemes.length < 1 || phonemes.length > 20) {
    return { ok: false, error: "A word must contain between 1 and 20 phonemes." };
  }
  if (phonemes.some((p) => p.length > 8)) {
    return { ok: false, error: "Each phoneme must be 8 characters or fewer." };
  }
  return { ok: true, english, phonemes };
}

export function validateWordListInput(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) return { ok: false, error: "List name is required and must be 100 characters or fewer." };
  if (!Array.isArray(body?.words) || body.words.length === 0) return { ok: false, error: "Add at least one word." };
  if (body.words.length > 200) return { ok: false, error: "A word list can contain at most 200 words." };
  const words = [];
  for (const word of body.words) {
    const result = validateWordInput(word);
    if (!result.ok) return result;
    words.push(result);
  }
  const duplicateCheck = new Set(words.map((w) => w.english.toLowerCase()));
  if (duplicateCheck.size !== words.length) return { ok: false, error: "Duplicate English words are not allowed." };
  return { ok: true, name, description: typeof body.description === "string" ? body.description.trim().slice(0, 500) : null, words };
}

export function validateActivityInput(body) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 100) return { ok: false, error: "Activity name is required and must be 100 characters or fewer." };
  if (!ACTIVITY_TYPES.includes(body?.activityType)) return { ok: false, error: "Activity type must be WORDLE or WORD_SEARCH." };
  if (!Number.isInteger(body?.wordListId) || body.wordListId < 1) return { ok: false, error: "A valid word list is required." };
  const difficulty = body.difficulty || "medium";
  if (!DIFFICULTIES.includes(difficulty)) return { ok: false, error: "Difficulty must be easy, medium, or hard." };
  const maxGuesses = Number.isInteger(body.maxGuesses) ? body.maxGuesses : 6;
  if (maxGuesses < 3 || maxGuesses > 10) return { ok: false, error: "Guess rows must be between 3 and 10." };
  const rows = body.rows == null ? null : Number(body.rows);
  const cols = body.cols == null ? null : Number(body.cols);
  if (body.activityType === "WORD_SEARCH") {
    if (!Number.isInteger(rows) || rows < 5 || rows > 20 || !Number.isInteger(cols) || cols < 5 || cols > 20) {
      return { ok: false, error: "Word Search rows and columns must be between 5 and 20." };
    }
  }
  return {
    ok: true,
    name,
    activityType: body.activityType,
    wordListId: body.wordListId,
    difficulty,
    maxGuesses,
    hintsEnabled: body.hintsEnabled !== false,
    rows,
    cols,
    showAnswers: body.showAnswers === true,
    outputTitle: typeof body.outputTitle === "string" ? body.outputTitle.trim().slice(0, 150) : null,
    metadata: body.metadata == null ? null : JSON.stringify(body.metadata).slice(0, 5000),
  };
}
