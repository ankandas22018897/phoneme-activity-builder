/**
 * Standalone HTML generation facade.
 * UI builders call these helpers; document templates live in:
 * - wordleGenerator.js
 * - wordSearchGenerator.js
 *
 * Generated files must run offline with no React / Next.js / npm / network.
 */

import { generateWordleHtml } from "./wordleGenerator";
import { generateWordSearchHtml } from "./wordSearchGenerator";

export { escapeHtml } from "./htmlEscape";

export function downloadHtml(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Build + download a phoneme Wordle activity HTML file */
export function downloadWordleActivity(config) {
  const html = generateWordleHtml(config);
  downloadHtml("phoneme-wordle.html", html);
  return html;
}

/** Build + download a phoneme Word Search activity HTML file */
export function downloadWordSearchActivity(config) {
  const html = generateWordSearchHtml(config);
  downloadHtml("phoneme-word-search.html", html);
  return html;
}

export { generateWordleHtml } from "./wordleGenerator";
export { generateWordSearchHtml } from "./wordSearchGenerator";
