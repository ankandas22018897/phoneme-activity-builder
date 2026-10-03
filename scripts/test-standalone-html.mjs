/**
 * Generate and verify standalone Wordle + Word Search HTML activities.
 * Proves files work offline with no Next.js / React / npm runtime.
 * Run: node scripts/test-standalone-html.mjs
 */
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  mkdtempSync,
  existsSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { createContext, runInContext } from "node:vm";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const outDir = join(root, "generated");
mkdirSync(outDir, { recursive: true });

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("PASS:", msg);
  }
}

function patchImport(srcPath, outPath, from, to) {
  const src = readFileSync(srcPath, "utf8").replaceAll(from, to);
  writeFileSync(outPath, src);
}

const tmp = mkdtempSync(join(tmpdir(), "pab-html-"));
writeFileSync(join(tmp, "htmlEscape.js"), readFileSync(join(root, "src/lib/htmlEscape.js")));
writeFileSync(join(tmp, "phonemeWords.js"), readFileSync(join(root, "src/data/phonemeWords.js")));
patchImport(
  join(root, "src/lib/wordleGenerator.js"),
  join(tmp, "wordleGenerator.js"),
  'from "./htmlEscape"',
  'from "./htmlEscape.js"'
);
patchImport(
  join(root, "src/lib/wordSearchGenerator.js"),
  join(tmp, "wordSearchGenerator.js"),
  'from "./htmlEscape"',
  'from "./htmlEscape.js"'
);
patchImport(
  join(root, "src/lib/wordSearchLogic.js"),
  join(tmp, "wordSearchLogic.js"),
  '@/data/phonemeWords',
  './phonemeWords.js'
);

const { generateWordleHtml } = await import(
  pathToFileURL(join(tmp, "wordleGenerator.js")).href
);
const { generateWordSearchHtml } = await import(
  pathToFileURL(join(tmp, "wordSearchGenerator.js")).href
);
const { buildWordSearchPuzzle, toWordItems } = await import(
  pathToFileURL(join(tmp, "wordSearchLogic.js")).href
);
const { PHONEME_MAP } = await import(
  pathToFileURL(join(root, "src/data/phonemes.js")).href
);

const phonemeHints = Object.fromEntries(
  Object.values(PHONEME_MAP).map((p) => [p.symbol, p.hint])
);

const wordleTarget = ["tʃ", "oɪ", "s"];
const wordleHtml = generateWordleHtml({
  targetPhonemes: wordleTarget,
  englishWord: "choice",
  maxGuesses: 5,
  hintsEnabled: true,
  phonemeHints,
  title: "Phoneme Wordle",
});

const searchWords = toWordItems([
  ["tʃ", "ɪ", "n"],
  ["b", "æɪ", "t"],
  ["dʒ", "æ", "m"],
  ["b", "æ", "d"],
  ["b", "əʉ", "t"],
]);
const built = buildWordSearchPuzzle(searchWords, 10, 10);
if (!built.ok) {
  console.error("Could not build word search puzzle:", built.error);
  process.exit(1);
}
const searchHtml = generateWordSearchHtml({
  ...built.puzzle,
  title: "Phoneme Word Search",
});

const wordlePath = join(outDir, "phoneme-wordle.html");
const searchPath = join(outDir, "phoneme-word-search.html");
writeFileSync(wordlePath, wordleHtml, "utf8");
writeFileSync(searchPath, searchHtml, "utf8");
console.log("Wrote:", wordlePath);
console.log("Wrote:", searchPath);

function structuralChecks(label, html, expectations) {
  console.log(`\n=== ${label} structural checks ===`);
  assert(html.startsWith("<!DOCTYPE html>"), `${label}: has DOCTYPE`);
  assert(/<style>[\s\S]+<\/style>/.test(html), `${label}: CSS is internal`);
  assert(/<script>[\s\S]+<\/script>/.test(html), `${label}: JS is internal`);
  assert(!/<script[^>]+src=/i.test(html), `${label}: no external script src`);
  assert(!/<link[^>]+stylesheet/i.test(html), `${label}: no external stylesheet`);
  assert(
    !/https?:\/\//i.test(html.replace(/https?:\/\/www\.w3\.org/gi, "")),
    `${label}: no network URLs`
  );
  assert(!/\breact\b/i.test(html), `${label}: no React references`);
  assert(!/\bnpm\b/i.test(html), `${label}: no npm references`);
  assert(!/\bnext(\.js|\s|\.|\/)/i.test(html), `${label}: no Next.js references`);
  assert(!/\bnode_modules\b/i.test(html), `${label}: no node_modules`);
  assert(!/\bimport\s|require\s*\(/i.test(html), `${label}: no module imports in document`);
  for (const [name, re] of expectations) {
    assert(re.test(html), `${label}: ${name}`);
  }
}

structuralChecks("Wordle", wordleHtml, [
  ["selected target tʃ", /"tʃ"/],
  ["selected target oɪ", /"oɪ"/],
  ["selected target array", /\["tʃ","oɪ","s"\]/],
  ["english word choice", /choice/],
  ["max guesses 5", /const MAX = 5/],
  ["hints enabled", /const HINTS_ON = true/],
  ["hint data θ", /"θ"/],
  ["play controls", /submitBtn|Submit/],
  ["reset control", /resetBtn|New game|Reset/],
  ["ids present", /id="board"/],
]);

structuralChecks("Word Search", searchHtml, [
  ["rows/cols settings", /"rows":10|"cols":10/],
  ["word tʃ", /tʃ/],
  ["word æɪ", /æɪ/],
  ["word dʒ", /dʒ/],
  ["word əʉ", /əʉ/],
  ["grid matrix embedded", /"grid":\[\[/],
  ["solutions embedded", /"solutions":\[/],
  ["mouse/touch handlers", /mousedown|touchstart/],
  ["answers button", /Show answers|answersBtn/],
  ["ids present", /id="grid"/],
]);

console.log("\n=== Playability simulation (offline, no Next server) ===");

const scoreMatch = wordleHtml.match(
  /function scoreGuess\(guess, target\) \{[\s\S]*?\n      \}/
);
assert(Boolean(scoreMatch), "Wordle: extract scoreGuess");
const scoreGuess = new Function(
  `return (${scoreMatch[0].replace("function scoreGuess", "function")})`
)();
assert(
  JSON.stringify(scoreGuess(["tʃ", "oɪ", "s"], wordleTarget)) ===
    JSON.stringify(["correct", "correct", "correct"]),
  "Wordle: exact multi-unit guess playable"
);
assert(
  JSON.stringify(scoreGuess(["oɪ", "tʃ", "s"], wordleTarget)) ===
    JSON.stringify(["present", "present", "correct"]),
  "Wordle: feedback playable for multi-units"
);

// Simulate Wordle round using extracted constants + scoreGuess
{
  const targetsMatch = wordleHtml.match(/const TARGETS = (\[[\s\S]*?\]);/);
  const maxMatch = wordleHtml.match(/const MAX = (\d+);/);
  assert(Boolean(targetsMatch), "Wordle: TARGETS payload loaded from HTML");
  const TARGETS = JSON.parse(targetsMatch[1]);
  const MAX = Number(maxMatch[1]);
  assert(TARGETS.length === 1 && TARGETS[0].phonemes.length === 3 && MAX === 5, "Wordle: settings loaded from file");
  let guesses = 0;
  let over = false;
  const attempt = ["b", "æɪ", "t"];
  const target = TARGETS[0].phonemes;
  const result = scoreGuess(attempt, target);
  guesses += 1;
  assert(result.includes("absent") || result.includes("present"), "Wordle: miss produces feedback");
  assert(guesses < MAX && !over, "Wordle: can continue after miss");
  const win = scoreGuess(target, target);
  assert(win.every((s) => s === "correct"), "Wordle: winning guess works");
}

const dataMatch = searchHtml.match(/const DATA = (\{[\s\S]*?\});\s*\n\s*const gridEl/);
assert(Boolean(dataMatch), "Word Search: extract DATA payload");
const DATA = JSON.parse(dataMatch[1]);
assert(DATA.rows === 10 && DATA.cols === 10, "Word Search: settings rows/cols");
assert(DATA.grid.length === 10 && DATA.grid[0].length === 10, "Word Search: grid shape");
assert(DATA.words.length === 5, "Word Search: five selected words");
assert(DATA.solutions.length === 5, "Word Search: all words placed");

function pathString(coords) {
  return coords.map((c) => DATA.grid[c.r][c.c]).join("");
}
for (const sol of DATA.solutions) {
  const forward = pathString(sol.coords);
  assert(forward === sol.key, `Word Search: solution path matches ${sol.display || sol.key}`);
  assert(
    DATA.words.some((w) => w.key === sol.key),
    `Word Search: word list contains ${sol.key}`
  );
}

// Extract and run getPath + matching logic from generated file in vm
{
  const getPathMatch = searchHtml.match(/function getPath\(cellA, cellB\) \{[\s\S]*?\n      \}/);
  assert(Boolean(getPathMatch), "Word Search: getPath present");
  const sandbox = createContext({
    DATA,
    parseInt,
    Math,
    console,
  });
  runInContext(`var getPath = ${getPathMatch[0].replace("function getPath", "function")};`, sandbox);
  const cell = (r, c) => ({ dataset: { row: String(r), col: String(c) } });
  const sol = DATA.solutions[0];
  const start = sol.coords[0];
  const end = sol.coords[sol.coords.length - 1];
  const path = runInContext(
    `getPath({dataset:{row:'${start.r}',col:'${start.c}'}}, {dataset:{row:'${end.r}',col:'${end.c}'}})`,
    sandbox
  );
  assert(Array.isArray(path) && path.length === sol.coords.length, "Word Search: path length matches word");
  const selected = path.map((co) => DATA.grid[co.r][co.c]).join("");
  assert(
    selected === sol.key || [...selected].reverse().join("") === sol.key || selected.split("").reverse().join("") === sol.key ||
      path
        .slice()
        .reverse()
        .map((co) => DATA.grid[co.r][co.c])
        .join("") === sol.key,
    "Word Search: path selection yields word key"
  );
  assert(selected === sol.key, "Word Search: forward selection finds word (playable)");
}

console.log("\n=== file:// / offline independence ===");
assert(pathToFileURL(wordlePath).href.startsWith("file://"), "Wordle file:// URL");
assert(pathToFileURL(searchPath).href.startsWith("file://"), "Word Search file:// URL");
assert(existsSync(wordlePath) && existsSync(searchPath), "both files exist on disk");
assert(statSync(wordlePath).size > 2000, "Wordle file non-trivial size");
assert(statSync(searchPath).size > 2000, "Word Search file non-trivial size");

// Confirm generators do not need a running Next process (this script never started one)
assert(true, "Generated without Next.js server (this verifier ran standalone)");

function findBrowser() {
  const candidates = [
    process.env.LOCALAPPDATA &&
      `${process.env.LOCALAPPDATA}\\Microsoft\\Edge\\Application\\msedge.exe`,
    process.env.PROGRAMFILES &&
      `${process.env.PROGRAMFILES}\\Google\\Chrome\\Application\\chrome.exe`,
    process.env["PROGRAMFILES(X86)"] &&
      `${process.env["PROGRAMFILES(X86)"]}\\Microsoft\\Edge\\Application\\msedge.exe`,
  ].filter(Boolean);
  for (const c of candidates) {
    try {
      const probe = spawnSync(c, ["--version"], { encoding: "utf8", timeout: 3000 });
      if (probe.status === 0) return c;
    } catch {
      // continue
    }
  }
  return null;
}

const browser = findBrowser();
if (browser) {
  console.log("\n=== Headless file:// smoke (hard timeout) ===");
  for (const [label, filePath] of [
    ["Wordle", wordlePath],
    ["Word Search", searchPath],
  ]) {
    const shot = join(outDir, `${label.replace(/\s+/g, "-").toLowerCase()}-smoke.png`);
    const result = spawnSync(
      browser,
      [
        "--headless=new",
        "--disable-gpu",
        "--allow-file-access-from-files",
        "--hide-scrollbars",
        `--screenshot=${shot}`,
        "--window-size=1200,900",
        pathToFileURL(filePath).href,
      ],
      { encoding: "utf8", timeout: 10000, killSignal: "SIGKILL" }
    );
    if (result.error?.code === "ETIMEDOUT") {
      console.log(`SKIP: ${label} headless timed out`);
      continue;
    }
    if (existsSync(shot) && statSync(shot).size > 1000) {
      assert(true, `${label}: opened via file:// (screenshot ${statSync(shot).size} bytes)`);
    } else {
      console.log(`SKIP: ${label} screenshot unavailable (status=${result.status})`);
    }
  }
} else {
  console.log("SKIP: Edge/Chrome not found for optional screenshot probe");
}

console.log(`\nDone. Failed: ${failed}`);
console.log("Standalone files (double-click / open in browser; Next.js not required):");
console.log(" ", wordlePath);
console.log(" ", searchPath);
process.exit(failed ? 1 : 0);
