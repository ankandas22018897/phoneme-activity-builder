import { escapeHtml } from "./htmlEscape";

function normalizeTargets(config = {}) {
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

/**
 * Build a standalone phoneme Wordle HTML document (no React / npm / network).
 * Supports a multi-word target pack; English is revealed per word when finished.
 */
export function generateWordleHtml(config) {
  const {
    maxGuesses = 6,
    hintsEnabled = true,
    phonemeHints = {},
    title = "PHONEME'LE",
  } = config;

  const targets = normalizeTargets(config);
  const targetsJson = JSON.stringify(targets);
  const hintsJson = JSON.stringify(phonemeHints);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --bg: #f4f7fb;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --border: #cbd5e1;
      --primary: #1d4f7c;
      --primary-hover: #163d5f;
      --correct: #15803d;
      --correct-bg: #dcfce7;
      --present: #a16207;
      --present-bg: #fef3c7;
      --absent: #64748b;
      --absent-bg: #e2e8f0;
      --focus: #2563eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 1rem;
    }
    .wrap { max-width: 42rem; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin: 0 0 0.25rem; color: var(--primary); letter-spacing: 0.02em; text-align: center; }
    .sub { color: var(--muted); margin-bottom: 0.75rem; text-align: center; }
    .progress { text-align: center; font-weight: 600; margin-bottom: 0.5rem; }
    .dots { display: flex; gap: 0.25rem; max-width: 16rem; margin: 0 auto 1rem; }
    .dot { height: 0.45rem; flex: 1; border-radius: 999px; background: #e2e8f0; }
    .dot.done { background: #22c55e; }
    .dot.now { background: var(--primary); }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .grid { display: grid; gap: 0.4rem; justify-content: center; margin-bottom: 1rem; }
    .row { display: flex; gap: 0.4rem; justify-content: center; }
    .row.active { outline: 2px solid var(--primary); outline-offset: 3px; border-radius: 8px; }
    .cell {
      width: clamp(2.4rem, 12vw, 3.4rem);
      height: clamp(2.4rem, 12vw, 3.4rem);
      border: 2px solid var(--border);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: clamp(0.95rem, 3.5vw, 1.25rem);
      background: #fff;
    }
    .cell.correct { background: var(--correct-bg); border-color: var(--correct); color: var(--correct); }
    .cell.present { background: var(--present-bg); border-color: var(--present); color: var(--present); }
    .cell.absent { background: var(--absent-bg); border-color: var(--absent); color: var(--absent); }
    .cell.filled { border-color: #94a3b8; }
    .status { text-align: center; min-height: 1.5rem; font-weight: 600; margin-bottom: 0.75rem; }
    .legend { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; font-size: 0.85rem; margin-bottom: 1rem; }
    .legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
    .swatch { width: 0.9rem; height: 0.9rem; border-radius: 3px; border: 1px solid #94a3b8; }
    .swatch.correct { background: var(--correct-bg); border-color: var(--correct); }
    .swatch.present { background: var(--present-bg); border-color: var(--present); }
    .swatch.absent { background: var(--absent-bg); border-color: var(--absent); }
    .kb-section { margin-top: 0.75rem; }
    .kb-label { font-size: 0.8rem; font-weight: 600; color: var(--muted); margin: 0.5rem 0 0.35rem; }
    .kb-row { display: flex; flex-wrap: wrap; gap: 0.3rem; margin-bottom: 0.3rem; justify-content: center; }
    .key {
      min-width: 2.4rem;
      min-height: 2.4rem;
      padding: 0.35rem 0.5rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: #f8fafc;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.95rem;
    }
    .key:hover { background: #e2e8f0; }
    .key:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
    .key.correct { background: var(--correct-bg); border-color: var(--correct); color: var(--correct); }
    .key.present { background: var(--present-bg); border-color: var(--present); color: var(--present); }
    .key.absent { background: var(--absent-bg); border-color: var(--absent); color: var(--absent); }
    .key.wide { min-width: 4.5rem; background: #e2e8f0; }
    .key.enter { min-width: 6rem; background: var(--primary); color: #fff; border-color: var(--primary); }
    .key.enter:hover { background: var(--primary-hover); }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; margin-top: 1rem; }
    button.action {
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.65rem 1rem;
      font-weight: 600;
      cursor: pointer;
    }
    button.action:hover { background: var(--primary-hover); }
    button.action.secondary { background: #475569; }
    button.action:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
    .hint-box { text-align: center; color: var(--muted); font-size: 0.9rem; min-height: 1.25rem; margin-top: 0.5rem; }
    .modal {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      align-items: center;
      justify-content: center;
      padding: 1rem;
      z-index: 50;
    }
    .modal.show { display: flex; }
    .modal-card {
      background: #fff;
      border-radius: 16px;
      padding: 1.5rem;
      max-width: 26rem;
      width: 100%;
      text-align: center;
      border: 1px solid var(--border);
    }
    .modal-card h2 { margin: 0.35rem 0; }
    .modal-card p { color: var(--muted); }
    .eyebrow { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
    .eyebrow.ok { color: #166534; }
    .eyebrow.bad { color: #a16207; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Play through a pack of phoneme words. English appears when each word is finished.</p>
    <div id="progress" class="progress"></div>
    <div id="dots" class="dots" aria-hidden="true"></div>
    <div class="card">
      <div class="legend" aria-label="Colour and label legend">
        <span><i class="swatch correct" aria-hidden="true"></i> Correct position</span>
        <span><i class="swatch present" aria-hidden="true"></i> Wrong position</span>
        <span><i class="swatch absent" aria-hidden="true"></i> Not in word</span>
      </div>
      <div id="status" class="status" role="status" aria-live="polite"></div>
      <div id="board" class="grid" aria-label="Guess board"></div>
      <div id="hint" class="hint-box" aria-live="polite"></div>
      <div id="keyboard"></div>
      <div class="actions">
        <button type="button" class="action secondary" id="clearBtn">Clear</button>
        <button type="button" class="action secondary" id="submitBtn">Submit</button>
        <button type="button" class="action secondary" id="resetBtn">Restart pack</button>
      </div>
    </div>
  </div>
  <div id="modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-card">
      <div id="modalEyebrow" class="eyebrow"></div>
      <h2 id="modalTitle"></h2>
      <p id="modalBody"></p>
      <button type="button" class="action" id="modalBtn" style="margin-top:1rem;width:100%;">Continue</button>
    </div>
  </div>
  <script>
    (function () {
      const TARGETS = ${targetsJson};
      const MAX = ${Number(maxGuesses)};
      const HINTS_ON = ${hintsEnabled ? "true" : "false"};
      const HINTS = ${hintsJson};
      const KEYBOARD = {
        consonants: [
          ["p","t","k","b","d","g"],
          ["n","m","ŋ","f","s","θ"],
          ["ʃ","v","z","ð","ʒ"],
          ["l","ɹ","w","j","h"],
          ["tʃ","dʒ"]
        ],
        vowels: [
          ["iː","ɪ","e","eː"],
          ["æ","ɐ","ɐː","ɜː"],
          ["ʉː","ɔ","oː","ʊ"],
          ["æɪ","ɑe","oɪ","əʉ"],
          ["æɔ","ɪə","ə"]
        ]
      };

      let round = 0;
      let wins = 0;
      let guesses = [];
      let current = [];
      let keyState = {};
      let gameOver = false;
      let lastWon = false;

      const board = document.getElementById("board");
      const statusEl = document.getElementById("status");
      const hintEl = document.getElementById("hint");
      const keyboardEl = document.getElementById("keyboard");
      const progressEl = document.getElementById("progress");
      const dotsEl = document.getElementById("dots");
      const modal = document.getElementById("modal");
      const modalEyebrow = document.getElementById("modalEyebrow");
      const modalTitle = document.getElementById("modalTitle");
      const modalBody = document.getElementById("modalBody");
      const modalBtn = document.getElementById("modalBtn");

      function target() { return TARGETS[round]; }
      function length() { return target().phonemes.length; }
      function english() { return target().english || ""; }

      function scoreGuess(guess, target) {
        const len = target.length;
        const result = Array(len).fill("absent");
        const remaining = {};
        for (let i = 0; i < len; i++) {
          if (guess[i] === target[i]) result[i] = "correct";
          else remaining[target[i]] = (remaining[target[i]] || 0) + 1;
        }
        for (let i = 0; i < len; i++) {
          if (result[i] === "correct") continue;
          const u = guess[i];
          if (remaining[u] > 0) {
            result[i] = "present";
            remaining[u] -= 1;
          }
        }
        return result;
      }

      function rank(a, b) {
        const order = { correct: 3, present: 2, absent: 1 };
        return (order[a] || 0) >= (order[b] || 0) ? a : b;
      }

      function updateProgress() {
        progressEl.textContent =
          "Word " + (round + 1) + " of " + TARGETS.length +
          " · " + length() + " phonemes · Solved " + wins;
        dotsEl.innerHTML = "";
        for (let i = 0; i < TARGETS.length; i++) {
          const d = document.createElement("span");
          d.className = "dot" + (i < round ? " done" : i === round ? " now" : "");
          dotsEl.appendChild(d);
        }
      }

      function showModal(packDone) {
        const eng = english();
        if (packDone) {
          modalEyebrow.textContent = "Pack complete";
          modalEyebrow.className = "eyebrow ok";
          modalTitle.textContent = "Congratulations!";
          modalBody.innerHTML =
            "You finished all " + TARGETS.length + " words.<br/>Solved " +
            wins + " of " + TARGETS.length +
            (eng ? ("<br/><strong>Last English: " + eng + "</strong>") : "") +
            "<br/>Phonemes: " + target().phonemes.join(" | ");
          modalBtn.textContent = "New Game";
          modalBtn.onclick = restartPack;
        } else {
          modalEyebrow.textContent = lastWon ? "Answer correct" : "Out of guesses";
          modalEyebrow.className = "eyebrow " + (lastWon ? "ok" : "bad");
          modalTitle.textContent = lastWon ? "Nice!" : "Round complete";
          modalBody.innerHTML =
            (eng ? ("<strong>English word: " + eng + "</strong><br/>") : "") +
            "Phonemes: " + target().phonemes.join(" | ") +
            "<br/>Word " + (round + 1) + " of " + TARGETS.length + " · Solved " + wins;
          modalBtn.textContent = "Continue";
          modalBtn.onclick = advanceWord;
        }
        modal.classList.add("show");
      }

      function hideModal() { modal.classList.remove("show"); }

      function render() {
        updateProgress();
        board.innerHTML = "";
        const len = length();
        for (let r = 0; r < MAX; r++) {
          const row = document.createElement("div");
          row.className = "row" + (!gameOver && r === guesses.length ? " active" : "");
          const guess = guesses[r];
          const draft = r === guesses.length ? current : null;
          for (let c = 0; c < len; c++) {
            const cell = document.createElement("div");
            cell.className = "cell";
            if (guess) {
              cell.textContent = guess.units[c];
              cell.classList.add(guess.result[c]);
            } else if (draft && draft[c]) {
              cell.textContent = draft[c];
              cell.classList.add("filled");
            }
            row.appendChild(cell);
          }
          board.appendChild(row);
        }
        renderKeyboard();
      }

      function renderKeyboard() {
        keyboardEl.innerHTML = "";
        ["consonants", "vowels"].forEach(function (section) {
          const wrap = document.createElement("div");
          wrap.className = "kb-section";
          const label = document.createElement("div");
          label.className = "kb-label";
          label.textContent = section === "consonants" ? "Consonants" : "Vowels";
          wrap.appendChild(label);
          KEYBOARD[section].forEach(function (symbols) {
            const row = document.createElement("div");
            row.className = "kb-row";
            symbols.forEach(function (sym) {
              const btn = document.createElement("button");
              btn.type = "button";
              btn.className = "key" + (keyState[sym] ? " " + keyState[sym] : "");
              btn.textContent = sym;
              const hint = HINTS[sym] || sym;
              btn.setAttribute("aria-label", HINTS_ON ? hint : ("Phoneme " + sym));
              btn.title = HINTS_ON ? hint : sym;
              btn.disabled = gameOver;
              btn.addEventListener("click", function () { addPhoneme(sym); });
              btn.addEventListener("focus", function () { if (HINTS_ON) hintEl.textContent = hint; });
              btn.addEventListener("mouseenter", function () { if (HINTS_ON) hintEl.textContent = hint; });
              btn.addEventListener("blur", function () { hintEl.textContent = ""; });
              btn.addEventListener("mouseleave", function () { if (document.activeElement !== btn) hintEl.textContent = ""; });
              row.appendChild(btn);
            });
            wrap.appendChild(row);
          });
          keyboardEl.appendChild(wrap);
        });

        const actions = document.createElement("div");
        actions.className = "kb-row";
        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "key wide";
        delBtn.textContent = "DEL";
        delBtn.disabled = gameOver;
        delBtn.addEventListener("click", deleteLast);
        const enterBtn = document.createElement("button");
        enterBtn.type = "button";
        enterBtn.className = "key enter";
        enterBtn.textContent = "ENTER";
        enterBtn.disabled = gameOver;
        enterBtn.addEventListener("click", submit);
        actions.appendChild(delBtn);
        actions.appendChild(enterBtn);
        keyboardEl.appendChild(actions);
      }

      function addPhoneme(sym) {
        if (gameOver || current.length >= length()) return;
        current.push(sym);
        if (current.length >= length()) {
          statusEl.textContent = "Row full — press ENTER to check this guess.";
        }
        render();
      }

      function deleteLast() {
        if (gameOver) return;
        current.pop();
        render();
      }

      function clearCurrent() {
        if (gameOver) return;
        current = [];
        render();
      }

      function submit() {
        if (gameOver) return;
        const tgt = target().phonemes;
        if (current.length !== tgt.length) {
          statusEl.textContent = "Enter " + tgt.length + " phonemes before pressing ENTER.";
          return;
        }
        const result = scoreGuess(current, tgt);
        guesses.push({ units: current.slice(), result: result });
        current.forEach(function (u, i) {
          keyState[u] = rank(result[i], keyState[u]);
        });
        lastWon = result.every(function (s) { return s === "correct"; });
        if (lastWon) {
          gameOver = true;
          wins += 1;
          statusEl.textContent = english()
            ? ("Correct! English word: " + english() + ".")
            : "Correct!";
          showModal(round >= TARGETS.length - 1);
        } else if (guesses.length >= MAX) {
          gameOver = true;
          statusEl.textContent = english()
            ? ("Out of guesses. English word: " + english() + ".")
            : ("Out of guesses. Phonemes: " + tgt.join(" "));
          showModal(round >= TARGETS.length - 1);
        } else {
          statusEl.textContent = "Guess " + guesses.length + " of " + MAX;
        }
        current = [];
        render();
      }

      function clearRound(msg) {
        guesses = [];
        current = [];
        keyState = {};
        gameOver = false;
        lastWon = false;
        hintEl.textContent = "";
        hideModal();
        statusEl.textContent = msg || "Enter phonemes, then press ENTER.";
        render();
      }

      function advanceWord() {
        if (round >= TARGETS.length - 1) {
          showModal(true);
          return;
        }
        round += 1;
        clearRound("Word " + (round + 1) + " of " + TARGETS.length + " — enter phonemes, then press ENTER.");
      }

      function restartPack() {
        round = 0;
        wins = 0;
        clearRound("New pack — enter phonemes, then press ENTER.");
      }

      document.getElementById("clearBtn").addEventListener("click", clearCurrent);
      document.getElementById("submitBtn").addEventListener("click", submit);
      document.getElementById("resetBtn").addEventListener("click", restartPack);
      window.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); submit(); }
        if (e.key === "Backspace") { e.preventDefault(); deleteLast(); }
      });
      restartPack();
    })();
  </script>
</body>
</html>`;
}
