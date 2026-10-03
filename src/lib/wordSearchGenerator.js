import { escapeHtml } from "./htmlEscape";

/**
 * Build a standalone phoneme Word Search HTML document.
 * Grid is pre-generated so the offline file needs no placement retries on open.
 */
export function generateWordSearchHtml(config) {
  const {
    grid,
    words,
    solutions,
    rows,
    cols,
    title = "Phoneme Word Search",
  } = config;

  const payload = JSON.stringify({ grid, words, solutions, rows, cols });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <style>
    :root {
      --primary: #1d4f7c;
      --bg: #f4f7fb;
      --card: #ffffff;
      --text: #0f172a;
      --muted: #475569;
      --border: #cbd5e1;
      --highlight: #fde68a;
      --found: #bbf7d0;
      --found-text: #166534;
      --answer: #fbcfe8;
      --focus: #2563eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Segoe UI", system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      padding: 1rem;
      min-height: 100vh;
    }
    .wrap { max-width: 56rem; margin: 0 auto; }
    h1 { color: var(--primary); font-size: 1.5rem; margin: 0 0 0.35rem; }
    .sub { color: var(--muted); margin-bottom: 1rem; }
    .layout {
      display: grid;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .layout { grid-template-columns: 1fr 280px; align-items: start; }
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1rem;
    }
    .wordsearch-grid {
      display: grid;
      gap: 2px;
      margin: 0 auto;
      width: max-content;
      max-width: 100%;
      overflow: auto;
      touch-action: none;
      user-select: none;
    }
    .grid-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: clamp(0.75rem, 2.8vw, 1.05rem);
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      cursor: pointer;
      width: clamp(1.8rem, 7vw, 2.5rem);
      height: clamp(1.8rem, 7vw, 2.5rem);
    }
    .grid-cell.highlighted { background: var(--highlight) !important; }
    .grid-cell.found { background: var(--found) !important; color: var(--found-text); }
    .grid-cell.answer { background: var(--answer) !important; }
    .grid-cell.wrong { background: #fecaca !important; color: #7f1d1d; border-color: #dc2626 !important; }
    .grid-cell.correct-flash { background: #86efac !important; color: #14532d; border-color: #16a34a !important; }
    .feedback { min-height: 1.25rem; font-size: 0.95rem; margin-bottom: 0.5rem; font-weight: 600; }
    .feedback.ok { color: #166534; }
    .feedback.bad { color: #b91c1c; }
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
    .word-items { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem; }
    .word-item {
      padding: 0.35rem 0.7rem;
      background: #f1f5f9;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid var(--border);
    }
    .word-item.found {
      text-decoration: line-through;
      color: #64748b;
      background: #f0fdf4;
    }
    .status { min-height: 1.4rem; font-weight: 600; margin-bottom: 0.75rem; }
    button {
      width: 100%;
      background: var(--primary);
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 0.7rem 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 0.5rem;
    }
    button:focus-visible { outline: 3px solid var(--focus); outline-offset: 2px; }
    button.secondary { background: #475569; }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${escapeHtml(title)}</h1>
    <p class="sub">Drag across phoneme cells to find each word. Multi-symbol phonemes count as one cell.</p>
    <div class="layout">
      <div class="card">
        <div id="status" class="status" role="status" aria-live="polite"></div>
        <div id="feedback" class="feedback" role="status" aria-live="polite"></div>
        <div id="grid" class="wordsearch-grid" role="grid" aria-label="Word search grid"></div>
      </div>
      <div class="card">
        <h2 style="margin:0;font-size:1.1rem;">Word list</h2>
        <div id="wordList" class="word-items"></div>
        <button type="button" id="answersBtn" class="secondary">Show answers</button>
        <button type="button" id="resetBtn">Reset found words</button>
        <button type="button" id="newGameBtn">New game</button>
      </div>
    </div>
  </div>
  <div id="winModal" class="modal" role="dialog" aria-modal="true" aria-labelledby="winTitle">
    <div class="modal-card">
      <div style="color:#166534;font-weight:700;text-transform:uppercase;font-size:0.85rem;">Puzzle complete</div>
      <h2 id="winTitle">Congratulations!</h2>
      <p>You found all the phoneme words.</p>
      <button type="button" id="modalNewGame">New Game</button>
    </div>
  </div>
  <script>
    (function () {
      const DATA = ${payload};
      const gridEl = document.getElementById("grid");
      const listEl = document.getElementById("wordList");
      const statusEl = document.getElementById("status");
      const feedbackEl = document.getElementById("feedback");
      const winModal = document.getElementById("winModal");
      let wordsData = DATA.words.map(function (w) {
        return {
          key: w.key || w.units.join(""),
          display: w.display || w.units.join(" "),
          units: w.units,
          found: false
        };
      });
      let showAnswers = false;
      let isSelecting = false;
      let startCell = null;
      let flashTimer = null;

      function setFeedback(text, kind) {
        feedbackEl.textContent = text || "";
        feedbackEl.className = "feedback" + (kind ? " " + kind : "");
      }

      function clearFlashClasses() {
        gridEl.querySelectorAll(".grid-cell.wrong, .grid-cell.correct-flash").forEach(function (c) {
          c.classList.remove("wrong");
          c.classList.remove("correct-flash");
        });
      }

      function flashPath(path, cls) {
        clearFlashClasses();
        path.forEach(function (co) {
          const cell = gridEl.querySelector("[data-row='" + co.r + "'][data-col='" + co.c + "']");
          if (cell) cell.classList.add(cls);
        });
        if (flashTimer) clearTimeout(flashTimer);
        flashTimer = setTimeout(clearFlashClasses, 550);
      }

      function maybeShowWin() {
        const foundCount = wordsData.filter(function (w) { return w.found; }).length;
        if (foundCount >= wordsData.length) {
          winModal.classList.add("show");
        }
      }

      function resetFound() {
        wordsData.forEach(function (w) { w.found = false; });
        showAnswers = false;
        document.getElementById("answersBtn").textContent = "Show answers";
        winModal.classList.remove("show");
        setFeedback("");
        renderGrid();
        renderList();
      }

      function renderList() {
        listEl.innerHTML = "";
        wordsData.forEach(function (w) {
          const item = document.createElement("div");
          item.className = "word-item" + (w.found ? " found" : "");
          item.id = "list-" + w.key;
          item.textContent = w.display;
          listEl.appendChild(item);
        });
        const foundCount = wordsData.filter(function (w) { return w.found; }).length;
        statusEl.textContent = foundCount + " of " + wordsData.length + " words found";
      }

      function renderGrid() {
        gridEl.innerHTML = "";
        gridEl.style.gridTemplateColumns = "repeat(" + DATA.cols + ", max-content)";
        for (let r = 0; r < DATA.rows; r++) {
          for (let c = 0; c < DATA.cols; c++) {
            const cell = document.createElement("div");
            cell.className = "grid-cell";
            cell.dataset.row = String(r);
            cell.dataset.col = String(c);
            cell.textContent = DATA.grid[r][c];
            cell.setAttribute("role", "gridcell");
            gridEl.appendChild(cell);
          }
        }
        wordsData.forEach(function (w) {
          if (!w.found) return;
          const sol = DATA.solutions.find(function (s) { return s.key === w.key; });
          if (!sol) return;
          sol.coords.forEach(function (co) {
            const cell = gridEl.querySelector("[data-row='" + co.r + "'][data-col='" + co.c + "']");
            if (cell) cell.classList.add("found");
          });
        });
        if (showAnswers) paintAnswers(true);
      }

      function getPath(cellA, cellB) {
        const r1 = parseInt(cellA.dataset.row, 10);
        const c1 = parseInt(cellA.dataset.col, 10);
        const r2 = parseInt(cellB.dataset.row, 10);
        const c2 = parseInt(cellB.dataset.col, 10);
        const dr = r2 - r1;
        const dc = c2 - c1;
        if (!(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc))) return null;
        const steps = Math.max(Math.abs(dr), Math.abs(dc));
        const stepR = steps === 0 ? 0 : dr / steps;
        const stepC = steps === 0 ? 0 : dc / steps;
        const path = [];
        for (let i = 0; i <= steps; i++) {
          path.push({ r: Math.round(r1 + stepR * i), c: Math.round(c1 + stepC * i) });
        }
        return path;
      }

      function clearHighlights() {
        gridEl.querySelectorAll(".grid-cell.highlighted").forEach(function (c) {
          c.classList.remove("highlighted");
        });
      }

      function highlightPath(a, b) {
        const path = getPath(a, b);
        if (!path) return;
        path.forEach(function (co) {
          const cell = gridEl.querySelector("[data-row='" + co.r + "'][data-col='" + co.c + "']");
          if (cell) cell.classList.add("highlighted");
        });
      }

      function checkSelection() {
        const highlighted = gridEl.querySelectorAll(".grid-cell.highlighted");
        if (!highlighted.length || !startCell) return;
        const last = highlighted[highlighted.length - 1];
        const path = getPath(startCell, last);
        if (!path || path.length < 2) {
          setFeedback("Drag across at least 2 phonemes to select a word.", "bad");
          return;
        }
        let str1 = "";
        let str2 = "";
        path.forEach(function (co) { str1 += DATA.grid[co.r][co.c]; });
        for (let i = path.length - 1; i >= 0; i--) str2 += DATA.grid[path[i].r][path[i].c];

        let matched = null;
        wordsData.forEach(function (w) {
          if (!w.found && (w.key === str1 || w.key === str2)) matched = w;
        });

        if (matched) {
          matched.found = true;
          flashPath(path, "correct-flash");
          path.forEach(function (co) {
            const cell = gridEl.querySelector("[data-row='" + co.r + "'][data-col='" + co.c + "']");
            if (cell) cell.classList.add("found");
          });
          setFeedback("Correct: " + matched.display, "ok");
          renderList();
          maybeShowWin();
        } else {
          flashPath(path, "wrong");
          setFeedback("Incorrect — try again.", "bad");
        }
      }

      function paintAnswers(on) {
        DATA.solutions.forEach(function (s) {
          s.coords.forEach(function (co) {
            const cell = gridEl.querySelector("[data-row='" + co.r + "'][data-col='" + co.c + "']");
            if (!cell) return;
            if (on) cell.classList.add("answer");
            else cell.classList.remove("answer");
          });
        });
      }

      function cellFromPoint(x, y) {
        const el = document.elementFromPoint(x, y);
        if (el && el.classList.contains("grid-cell") && el.parentNode === gridEl) return el;
        return null;
      }

      gridEl.addEventListener("mousedown", function (e) {
        if (!e.target.classList.contains("grid-cell")) return;
        isSelecting = true;
        startCell = e.target;
        clearHighlights();
        e.target.classList.add("highlighted");
        e.preventDefault();
      });
      window.addEventListener("mousemove", function (e) {
        if (!isSelecting) return;
        const cell = cellFromPoint(e.clientX, e.clientY);
        if (cell) {
          clearHighlights();
          highlightPath(startCell, cell);
        }
      });
      window.addEventListener("mouseup", function () {
        if (!isSelecting) return;
        isSelecting = false;
        checkSelection();
        clearHighlights();
      });

      gridEl.addEventListener("touchstart", function (e) {
        const t = e.touches[0];
        const cell = cellFromPoint(t.clientX, t.clientY);
        if (!cell) return;
        isSelecting = true;
        startCell = cell;
        clearHighlights();
        cell.classList.add("highlighted");
        e.preventDefault();
      }, { passive: false });
      window.addEventListener("touchmove", function (e) {
        if (!isSelecting) return;
        const t = e.touches[0];
        const cell = cellFromPoint(t.clientX, t.clientY);
        if (cell) {
          clearHighlights();
          highlightPath(startCell, cell);
        }
        e.preventDefault();
      }, { passive: false });
      window.addEventListener("touchend", function () {
        if (!isSelecting) return;
        isSelecting = false;
        checkSelection();
        clearHighlights();
      });

      document.getElementById("answersBtn").addEventListener("click", function () {
        showAnswers = !showAnswers;
        paintAnswers(showAnswers);
        this.textContent = showAnswers ? "Hide answers" : "Show answers";
      });
      document.getElementById("resetBtn").addEventListener("click", resetFound);
      document.getElementById("newGameBtn").addEventListener("click", function () {
        resetFound();
      });
      document.getElementById("modalNewGame").addEventListener("click", function () {
        resetFound();
      });

      renderGrid();
      renderList();
      setFeedback("Drag in a straight line to select a word.");
    })();
  </script>
</body>
</html>`;
}
