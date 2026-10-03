/**
 * Phoneme Word Search logic — grid placement and selection helpers.
 * Each multi-character phoneme occupies ONE cell.
 * UI builders and HTML generators should use these helpers (no duplicated placement).
 */

import { PHONEME_WORDS } from "@/data/phonemeWords";

export const DIRECTIONS = [
  { dr: 0, dc: 1 },
  { dr: 0, dc: -1 },
  { dr: 1, dc: 0 },
  { dr: -1, dc: 0 },
  { dr: 1, dc: 1 },
  { dr: 1, dc: -1 },
  { dr: -1, dc: 1 },
  { dr: -1, dc: -1 },
];

function canPlace(grid, units, r, c, d, rows, cols) {
  const len = units.length;
  const endR = r + d.dr * (len - 1);
  const endC = c + d.dc * (len - 1);
  if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) return false;

  for (let i = 0; i < len; i++) {
    const currR = r + d.dr * i;
    const currC = c + d.dc * i;
    const existing = grid[currR][currC];
    if (existing && existing !== units[i]) return false;
  }
  return true;
}

/**
 * @param {string[][]} words - array of phoneme-unit arrays
 * @param {number} rows
 * @param {number} cols
 * @param {{ maxAttempts?: number }} [options]
 */
export function generateWordSearchGrid(words, rows, cols, options = {}) {
  const maxAttempts = options.maxAttempts ?? 200;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
  const solutions = [];
  const failed = [];
  const pool = [];

  words.forEach((units) => {
    units.forEach((p) => {
      if (!pool.includes(p)) pool.push(p);
    });
  });
  if (pool.length === 0) {
    pool.push("æ", "b", "d", "ɪ", "p", "s", "t");
  }

  words.forEach((units) => {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < maxAttempts) {
      attempts += 1;
      const d = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (canPlace(grid, units, r, c, d, rows, cols)) {
        const coords = [];
        for (let i = 0; i < units.length; i++) {
          const currR = r + d.dr * i;
          const currC = c + d.dc * i;
          grid[currR][currC] = units[i];
          coords.push({ r: currR, c: currC });
        }
        solutions.push({
          key: units.join(""),
          display: units.join(" "),
          units,
          coords,
        });
        placed = true;
      }
    }
    if (!placed) {
      failed.push(units.join(" "));
    }
  });

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!grid[r][c]) {
        grid[r][c] = pool[Math.floor(Math.random() * pool.length)];
      }
    }
  }

  return { grid, solutions, failed, rows, cols };
}

/** Straight-line path between two cells, or null if not aligned */
export function getCellPath(r1, c1, r2, c2) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [{ r: r1, c: c1 }];
  const stepR = dr === 0 ? 0 : dr / steps;
  const stepC = dc === 0 ? 0 : dc / steps;
  const path = [];
  for (let i = 0; i <= steps; i++) {
    path.push({
      r: Math.round(r1 + stepR * i),
      c: Math.round(c1 + stepC * i),
    });
  }
  return path;
}

export function pathToStrings(grid, path) {
  let forward = "";
  let reverse = "";
  path.forEach((co) => {
    const r = Math.round(co.r);
    const c = Math.round(co.c);
    forward += grid[r][c];
  });
  for (let i = path.length - 1; i >= 0; i--) {
    const r = Math.round(path[i].r);
    const c = Math.round(path[i].c);
    reverse += grid[r][c];
  }
  return { forward, reverse };
}

export function validateWordSearchConfig(words, rows, cols) {
  if (!words || words.length === 0) {
    return { ok: false, error: "Add at least one phoneme word." };
  }
  if (words.length > 12) {
    return {
      ok: false,
      error: "Please use 12 words or fewer for a readable puzzle.",
    };
  }
  if (rows < 5 || cols < 5) {
    return { ok: false, error: "Grid must be at least 5×5." };
  }
  if (rows > 20 || cols > 20) {
    return { ok: false, error: "Grid must be 20×20 or smaller." };
  }
  const maxDim = Math.max(rows, cols);
  for (const units of words) {
    if (!units.length) {
      return { ok: false, error: "Empty words are not allowed." };
    }
    if (units.length > maxDim) {
      return {
        ok: false,
        error: `"${units.join(" ")}" is longer than the grid (${maxDim} cells). Increase rows/cols.`,
      };
    }
  }
  return { ok: true };
}

/** Normalize phoneme-unit arrays into word-list items for UI / HTML export */
export function toWordItems(unitLists) {
  return unitLists.map((units) => ({
    units,
    key: units.join(""),
    display: units.join(" "),
  }));
}

/** How many words to place for a given grid size (clamped for readability). */
export function wordCountForGrid(rows, cols) {
  const r = Math.max(5, Math.min(20, Number(rows) || 10));
  const c = Math.max(5, Math.min(20, Number(cols) || 10));
  const area = r * c;
  // Roughly one word per ~12 cells; small grids get fewer, large up to 12.
  return Math.min(12, Math.max(4, Math.round(area / 12)));
}

/**
 * Pick a random phoneme word list that fits the grid dimensions.
 * Longer grids can include longer words; count scales with box size.
 */
export function pickRandomWordsForGrid(rows, cols) {
  const maxDim = Math.max(rows, cols);
  const count = wordCountForGrid(rows, cols);
  const eligible = PHONEME_WORDS.filter(
    (w) =>
      Array.isArray(w.phonemes) &&
      w.phonemes.length >= 2 &&
      w.phonemes.length <= maxDim
  );

  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const picked = [];
  const seen = new Set();

  for (const entry of shuffled) {
    const key = entry.phonemes.join("");
    if (seen.has(key)) continue;
    seen.add(key);
    picked.push(entry.phonemes);
    if (picked.length >= count) break;
  }

  const words = toWordItems(picked);
  const text = words.map((w) => w.display).join("\n");
  return { words, text, count: words.length };
}

/**
 * Build a full puzzle object from teacher word items + grid size.
 * @param {{ units: string[], key?: string, display?: string }[]} wordItems
 */
export function buildWordSearchPuzzle(wordItems, rows, cols, options = {}) {
  const lists = wordItems.map((w) => w.units);
  const validation = validateWordSearchConfig(lists, rows, cols);
  if (!validation.ok) {
    return { ok: false, error: validation.error };
  }

  const result = generateWordSearchGrid(lists, rows, cols, options);
  const words = wordItems.map((w) => ({
    key: w.key || w.units.join(""),
    display: w.display || w.units.join(" "),
    units: w.units,
  }));

  const puzzle = {
    grid: result.grid,
    rows: result.rows,
    cols: result.cols,
    solutions: result.solutions,
    words,
  };

  if (result.failed.length) {
    return {
      ok: false,
      error: `Could not place: ${result.failed.join(", ")}. Try a larger grid.`,
      puzzle,
    };
  }

  return { ok: true, puzzle };
}

/** Match a selected path against the word list (forward or reverse). */
export function matchSelectionToWord(grid, path, words, alreadyFoundKeys = []) {
  if (!path?.length) return null;
  const { forward, reverse } = pathToStrings(grid, path);
  return (
    words.find(
      (w) =>
        !alreadyFoundKeys.includes(w.key) &&
        (w.key === forward || w.key === reverse)
    ) || null
  );
}
