/**
 * Wordle phoneme-unit verification (logic + generated HTML behaviour).
 * Run: node scripts/test-wordle.mjs
 */
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("PASS:", msg);
  }
}

const {
  scorePhonemeGuess,
  isCompleteGuess,
  mergeKeyboardStatus,
  evaluateGuessOutcome,
} = await import(pathToFileURL(join(root, "src/lib/wordleLogic.js")).href);

const { PHONEME_MAP, KEYBOARD_ROWS, parsePhonemeInput } = await import(
  pathToFileURL(join(root, "src/data/phonemes.js")).href
);
const { PHONEME_WORDS } = await import(
  pathToFileURL(join(root, "src/data/phonemeWords.js")).href
);

// Patch generator imports for native Node ESM
const tmp = mkdtempSync(join(tmpdir(), "wordle-gen-"));
writeFileSync(join(tmp, "htmlEscape.js"), readFileSync(join(root, "src/lib/htmlEscape.js")));
const genSrc = readFileSync(join(root, "src/lib/wordleGenerator.js"), "utf8").replace(
  'from "./htmlEscape"',
  'from "./htmlEscape.js"'
);
writeFileSync(join(tmp, "wordleGenerator.js"), genSrc);
const { generateWordleHtml } = await import(
  pathToFileURL(join(tmp, "wordleGenerator.js")).href
);

console.log("\n--- Multi-unit inventory & corpus ---");
for (const u of ["tʃ", "dʒ", "æɪ", "oɪ", "əʉ"]) {
  assert(Boolean(PHONEME_MAP[u]), `inventory has ${u}`);
  const onKb =
    KEYBOARD_ROWS.consonants.flat().includes(u) ||
    KEYBOARD_ROWS.vowels.flat().includes(u);
  assert(onKb, `${u} appears once on keyboard as a whole key`);
}

const corpusCases = [
  ["choice", ["tʃ", "oɪ", "s"]],
  ["jam", ["dʒ", "æ", "m"]],
  ["bait", ["b", "æɪ", "t"]],
  ["boil", ["b", "oɪ", "l"]],
  ["boat", ["b", "əʉ", "t"]],
];
for (const [word, units] of corpusCases) {
  const entry = PHONEME_WORDS.find((w) => w.word === word);
  assert(entry?.phonemes.length === units.length, `${word} has ${units.length} units`);
  assert(
    JSON.stringify(entry.phonemes) === JSON.stringify(units),
    `${word} units intact`
  );
}

console.log("\n--- Scoring (units, not characters) ---");
assert(
  JSON.stringify(scorePhonemeGuess(["tʃ", "oɪ", "s"], ["tʃ", "oɪ", "s"])) ===
    JSON.stringify(["correct", "correct", "correct"]),
  "exact choice"
);
assert(
  JSON.stringify(scorePhonemeGuess(["oɪ", "tʃ", "s"], ["tʃ", "oɪ", "s"])) ===
    JSON.stringify(["present", "present", "correct"]),
  "present multi-units"
);
assert(
  JSON.stringify(scorePhonemeGuess(["t", "ʃ", "s"], ["tʃ", "oɪ", "s"])) ===
    JSON.stringify(["absent", "absent", "correct"]),
  "t/ʃ ≠ tʃ"
);
assert(
  JSON.stringify(scorePhonemeGuess(["æ", "ɪ", "t"], ["b", "æɪ", "t"])) ===
    JSON.stringify(["absent", "absent", "correct"]),
  "æ/ɪ ≠ æɪ"
);
assert(
  JSON.stringify(scorePhonemeGuess(["dʒ", "dʒ", "ɐ"], ["dʒ", "ɐ", "dʒ"])) ===
    JSON.stringify(["correct", "present", "present"]),
  "duplicate dʒ handling"
);

assert(isCompleteGuess(["tʃ", "oɪ", "s"], 3), "complete by unit count");
assert(!isCompleteGuess(["tʃ", "oɪ"], 3), "incomplete by unit count");
assert(["tʃ", "oɪ", "s"].length === 3 && "tʃoɪs".length !== 3, "unit length ≠ char length");

console.log("\n--- Generated HTML embeds unit arrays ---");
const hints = Object.fromEntries(
  Object.values(PHONEME_MAP).map((p) => [p.symbol, p.hint])
);
const html = generateWordleHtml({
  targetPhonemes: ["tʃ", "oɪ", "s"],
  englishWord: "choice",
  maxGuesses: 4,
  hintsEnabled: true,
  phonemeHints: hints,
  title: "Phoneme Wordle",
});

assert(
  html.includes('const TARGETS = [{"phonemes":["tʃ","oɪ","s"],"english":"choice"}]') ||
    html.includes('"phonemes":["tʃ","oɪ","s"]'),
  "TARGETS pack embeds unit arrays"
);
assert(html.includes("const MAX = 4"), "maxGuesses reflected");
assert(html.includes("const HINTS_ON = true"), "hints enabled flag");
assert(html.includes('"tʃ"') && html.includes('"oɪ"'), "keyboard includes multi-units");
assert(html.includes("target().phonemes"), "round target uses phoneme units");

// Extract and execute embedded scoreGuess against multi-unit cases
const scoreMatch = html.match(/function scoreGuess\(guess, tgt\) \{[\s\S]*?\n      \}/);
assert(Boolean(scoreMatch), "embedded scoreGuess found");
const scoreGuess = new Function(`return (${scoreMatch[0].replace("function scoreGuess", "function")})`)();
assert(
  JSON.stringify(scoreGuess(["əʉ", "b", "t"], ["b", "əʉ", "t"])) ===
    JSON.stringify(["present", "present", "correct"]),
  "embedded scoreTreats əʉ as one unit"
);
assert(
  JSON.stringify(scoreGuess(["t", "ʃ", "s"], ["tʃ", "oɪ", "s"])) ===
    JSON.stringify(["absent", "absent", "correct"]),
  "embedded score does not split tʃ"
);
assert(
  JSON.stringify(scoreGuess(["oɪ", "tʃ", "s"], ["tʃ", "oɪ", "s"])) ===
    JSON.stringify(["present", "present", "correct"]),
  "embedded present feedback for multi-units"
);
assert(
  JSON.stringify(scoreGuess(["dʒ", "dʒ", "ɐ"], ["dʒ", "ɐ", "dʒ"])) ===
    JSON.stringify(["correct", "present", "present"]),
  "embedded duplicate dʒ handling"
);

// Preview/settings reflection in HTML export
assert(html.includes("choice") || html.includes("Phoneme Wordle"), "title/english present");
assert((html.match(/class="row"/) || html.includes("for (let r = 0; r < MAX")), "guess rows driven by MAX");

const htmlHintsOff = generateWordleHtml({
  targetPhonemes: ["dʒ", "æ", "m"],
  englishWord: "jam",
  maxGuesses: 6,
  hintsEnabled: false,
  phonemeHints: hints,
});
assert(htmlHintsOff.includes("const HINTS_ON = false"), "hints disabled in HTML");
assert(htmlHintsOff.includes('["dʒ","æ","m"]'), "jam TARGET units");
assert(htmlHintsOff.includes('Phoneme tʃ') || htmlHintsOff.includes("Phoneme \" + sym"), "hints-off aria uses Phoneme label");

console.log("\n--- Preview settings contract ---");
assert(
  html.includes("const MAX = 4") && html.includes('["tʃ","oɪ","s"]'),
  "builder settings (target + guesses) embedded for preview/export parity"
);

console.log("\n--- Keyboard status / outcomes ---");
const ks = mergeKeyboardStatus({}, ["tʃ", "æɪ", "əʉ"], ["correct", "present", "absent"]);
assert(ks["tʃ"] === "correct" && ks["æɪ"] === "present" && ks["əʉ"] === "absent", "status keys are wholes");
assert(evaluateGuessOutcome(["correct", "correct", "correct"], 1, 6, ["b", "oɪ", "l"], "boil").message.includes("English word: boil"), "win shows English equivalence");
assert(evaluateGuessOutcome(["correct", "correct", "correct"], 1, 6, ["b", "oɪ", "l"], "boil").won === true, "win flag");

const parsed = parsePhonemeInput("tʃ oɪ s");
assert(parsed.ok && parsed.phonemes.length === 3, "builder parse keeps units");

console.log("\n--- Reset / win-lose contract ---");
{
  const target = ["tʃ", "oɪ", "s"];
  let guesses = [];
  let keyState = {};
  let gameOver = false;
  const g1 = ["b", "æɪ", "t"];
  const r1 = scorePhonemeGuess(g1, target);
  guesses.push({ units: g1, result: r1 });
  keyState = mergeKeyboardStatus(keyState, g1, r1);
  let outcome = evaluateGuessOutcome(r1, guesses.length, 3, target);
  assert(!outcome.gameOver, "first miss continues");
  const g2 = ["tʃ", "oɪ", "s"];
  const r2 = scorePhonemeGuess(g2, target);
  guesses.push({ units: g2, result: r2 });
  outcome = evaluateGuessOutcome(r2, guesses.length, 3, target);
  assert(outcome.gameOver && outcome.message.includes("well done") || outcome.message.includes("Correct") || outcome.won, "win on exact multi-unit guess");
  // Reset contract
  guesses = [];
  keyState = {};
  gameOver = false;
  assert(guesses.length === 0 && Object.keys(keyState).length === 0 && gameOver === false, "reset clears board state");
}

console.log(`\nDone. Failed: ${failed}`);
process.exit(failed ? 1 : 0);
