"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateWordleHtml, generateWordSearchHtml } from "@/lib/htmlGenerator";
import { buildWordSearchPuzzle } from "@/lib/wordSearchLogic";

const emptyWord = { english: "", phonemes: "" };
const now = () => performance.now();

export default function ActivitiesPage() {
  const [lists, setLists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [words, setWords] = useState([{ ...emptyWord }]);
  const [activityName, setActivityName] = useState("");
  const [activityType, setActivityType] = useState("WORDLE");
  const [difficulty, setDifficulty] = useState("medium");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [maxGuesses, setMaxGuesses] = useState(6);
  const [hintsEnabled, setHintsEnabled] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [listsRes, activitiesRes] = await Promise.all([fetch("/api/word-lists"), fetch("/api/activities")]);
    if (!listsRes.ok || !activitiesRes.ok) throw new Error("Could not load saved data.");
    const listsData = await listsRes.json();
    const activitiesData = await activitiesRes.json();
    setLists(listsData);
    setActivities(activitiesData);
    return { listsData, activitiesData };
  }

  useEffect(() => {
    const initial = setTimeout(() => load().catch((e) => setError(e.message)), 0);
    return () => clearTimeout(initial);
  }, []);

  const wordCount = useMemo(() => words.filter((w) => w.english.trim() || w.phonemes.trim()).length, [words]);

  function addWordRow() { setWords((current) => [...current, { ...emptyWord }]); }
  function removeWordRow(index) { setWords((current) => current.length === 1 ? current : current.filter((_, i) => i !== index)); }
  function updateWord(index, field, value) { setWords((current) => current.map((w, i) => i === index ? { ...w, [field]: value } : w)); }

  async function saveList(event) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      const payload = { name, description, words: words.filter((w) => w.english.trim() || w.phonemes.trim()) };
      const url = selectedList ? `/api/word-lists/${selectedList.id}` : "/api/word-lists";
      const response = await fetch(url, { method: selectedList ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save word list.");
      setSelectedList(data); setMessage(selectedList ? "Word list updated." : "Word list saved."); await load();
    } catch (e) { setError(e.message); }
  }

  async function editList(id) {
    setError("");
    const response = await fetch(`/api/word-lists/${id}`);
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not load word list.");
    setSelectedList(data); setName(data.name); setDescription(data.description || "");
    setWords(data.words.map((w) => ({ english: w.english, phonemes: Array.isArray(w.phonemes) ? w.phonemes.join(" ") : w.phonemes })));
  }

  async function deleteList(id) {
    if (!window.confirm("Delete this word list and its linked activities?")) return;
    const response = await fetch(`/api/word-lists/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not delete word list.");
    if (selectedList?.id === id) { setSelectedList(null); setName(""); setDescription(""); setWords([{ ...emptyWord }]); }
    setMessage("Word list deleted."); await load();
  }

  function editActivity(activity) {
    setError("");
    setSelectedActivity(activity);
    setActivityName(activity.name);
    setActivityType(activity.activityType);
    setDifficulty(activity.difficulty);
    setRows(activity.rows || 10);
    setCols(activity.cols || 10);
    setMaxGuesses(activity.maxGuesses || 6);
    setHintsEnabled(activity.hintsEnabled);
    const linkedList = lists.find((l) => l.id === activity.wordListId);
    if (linkedList) setSelectedList(linkedList);
  }

  function cancelActivityEdit() {
    setSelectedActivity(null);
    setActivityName("");
    setRows(10);
    setCols(10);
    setMaxGuesses(6);
    setHintsEnabled(true);
  }

  async function saveActivity(event) {
    event.preventDefault(); setError(""); setMessage("");
    if (!selectedList) return setError("Save or select a word list before configuring an activity.");
    
    try {
      const payload = {
        name: activityName,
        activityType,
        difficulty,
        wordListId: selectedList.id,
        maxGuesses,
        hintsEnabled,
        rows,
        cols,
        outputTitle: activityName,
      };

      const url = selectedActivity ? `/api/activities/${selectedActivity.id}` : "/api/activities";
      const method = selectedActivity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save activity.");

      setMessage(selectedActivity ? "Activity configuration successfully updated in the database." : "Activity configuration saved to the database.");
      setSelectedActivity(null);
      setActivityName("");
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteActivity(id) {
    const response = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not delete activity.");
    if (selectedActivity?.id === id) cancelActivityEdit();
    setMessage("Activity deleted."); await load();
  }

  async function generateSaved(id) {
    setError("");
    const startTime = now();
    let attemptedType = activities.find((a) => a.id === id)?.activityType || "WORD_SEARCH";
    try {
      const response = await fetch(`/api/activities/${id}`);
      const activity = await response.json();
      if (!response.ok) throw new Error(activity.error || "Could not load activity.");
      attemptedType = activity.activityType;
      const targetWords = activity.wordList.words.map((w) => ({
        phonemes: Array.isArray(w.phonemes) ? w.phonemes : w.phonemes.split(/[- ]+/),
        english: w.english,
      }));

      let html;
      if (activity.activityType === "WORDLE") {
        html = generateWordleHtml({
          targets: targetWords.slice(0, Math.min(targetWords.length, 5)),
          maxGuesses: activity.maxGuesses,
          hintsEnabled: activity.hintsEnabled,
          title: activity.outputTitle || activity.name,
        });
      } else {
        const items = targetWords.map((w) => ({
          units: w.phonemes,
          key: w.phonemes.join(""),
          display: w.phonemes.join(" "),
        }));
        const built = buildWordSearchPuzzle(items, activity.rows || 10, activity.cols || 10);
        if (!built.ok) throw new Error(built.error);
        html = generateWordSearchHtml({ ...built.puzzle, title: activity.outputTitle || activity.name });
      }

      const durationMs = Math.round(now() - startTime);

      // Log successful generation to telemetry
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generation",
          activityType: activity.activityType,
          activityId: activity.id,
          status: "SUCCESS",
          durationMs,
          wordCount: targetWords.length,
        }),
      }).catch(() => {});

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = activity.activityType === "WORDLE" ? "phoneme-wordle.html" : "phoneme-word-search.html";
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage(`Generated HTML from stored ${activity.activityType === "WORDLE" ? "Wordle" : "Word Search"} data in ${durationMs}ms.`);
    } catch (e) {
      const durationMs = Math.round(now() - startTime);
      // Log failed generation to telemetry
      fetch("/api/telemetry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "generation",
          activityType: attemptedType,
          activityId: id,
          status: "FAILED",
          durationMs,
          errorMessage: e.message,
        }),
      }).catch(() => {});
      setError(e.message);
    }
  }

  return (
    <div className="page-shell space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Database &amp; Activity Configurations</p>
        <h1 className="mt-1 text-3xl font-bold">Saved Activities &amp; Word Lists</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Manage reusable phoneme word lists and activity configurations with full CRUD support (Create, Read, Update, Delete). Generated activities are logged to operational metrics.
        </p>
      </header>
      
      {error && <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-100" role="alert">{error}</p>}
      {message && <p className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-100" role="status">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SECTION 1: WORD LIST CRUD */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">1. Word List Management</h2>
            {selectedList && (
              <button
                type="button"
                onClick={() => { setSelectedList(null); setName(""); setDescription(""); setWords([{ ...emptyWord }]); }}
                className="text-xs text-[var(--primary)] underline"
              >
                + New Word List
              </button>
            )}
          </div>
          <form onSubmit={saveList} className="mt-4 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Word list name" required className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            <div className="space-y-2">
              {words.map((word, index) => (
                <div key={index} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                  <input value={word.english} onChange={(e) => updateWord(index, "english", e.target.value)} placeholder="English word" className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2" />
                  <input value={word.phonemes} onChange={(e) => updateWord(index, "phonemes", e.target.value)} placeholder="e.g. sh-i-p or ʃ ɪ p" className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 font-mono" />
                  <button type="button" onClick={() => removeWordRow(index)} className="rounded-lg border border-[var(--border)] px-3 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]" aria-label="Remove word">×</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={addWordRow} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm">+ Add word</button>
              <button className="rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white">
                {selectedList ? "Update Word List" : "Save Word List"}
              </button>
            </div>
          </form>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{wordCount} word(s) currently in the editor.</p>
          <div className="mt-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Saved Lists in Database</h3>
            {lists.map((list) => (
              <div key={list.id} data-testid={`word-list-row-${list.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] p-3">
                <div>
                  <strong data-testid="word-list-name">{list.name}</strong>
                  <span className="ml-2 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs text-[var(--text-muted)]">{list._count?.words || list.words?.length || 0} words</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editList(list.id)} data-testid={`edit-list-btn-${list.id}`} className="text-sm font-semibold text-[var(--primary)] hover:underline">Edit</button>
                  <button onClick={() => deleteList(list.id)} data-testid={`delete-list-btn-${list.id}`} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
            {!lists.length && <p className="text-sm text-[var(--text-muted)]">No saved lists yet.</p>}
          </div>
        </section>

        {/* SECTION 2: ACTIVITY CONFIGURATION (WITH FULL UPDATE WORKFLOW!) */}
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">2. Activity Configuration (CRUD)</h2>
            {selectedActivity && (
              <button
                type="button"
                onClick={cancelActivityEdit}
                className="text-xs text-amber-600 underline dark:text-amber-400"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>
          
          {selectedActivity && (
            <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
              Editing: <strong>{selectedActivity.name}</strong> (ID: {selectedActivity.id})
            </div>
          )}

          <form onSubmit={saveActivity} className="mt-4 space-y-3">
            <input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Activity title" required className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            
            <select
              value={selectedList?.id || ""}
              onChange={(e) => {
                const found = lists.find((l) => l.id === Number(e.target.value));
                if (found) setSelectedList(found);
              }}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"
            >
              <option value="">-- Select Linked Word List --</option>
              {lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}
            </select>

            <div className="grid grid-cols-2 gap-2">
              <select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2">
                <option value="WORDLE">Wordle</option>
                <option value="WORD_SEARCH">Word Search</option>
              </select>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {activityType === "WORD_SEARCH" && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-[var(--text-muted)]">Rows</label>
                  <input type="number" min="6" max="20" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)]">Columns</label>
                  <input type="number" min="6" max="20" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
                </div>
              </div>
            )}

            {activityType === "WORDLE" && (
              <div>
                <label className="text-xs text-[var(--text-muted)]">Max Guesses Allowed</label>
                <input type="number" min="3" max="10" value={maxGuesses} onChange={(e) => setMaxGuesses(Number(e.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={hintsEnabled} onChange={(e) => setHintsEnabled(e.target.checked)} />
              Enable phoneme audio/symbol hints
            </label>

            <button className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 font-semibold text-white">
              {selectedActivity ? "Update Activity Configuration" : "Save Activity Configuration"}
            </button>
          </form>

          <div className="mt-5 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Saved Activity Configurations</h3>
            {activities.map((activity) => (
              <div key={activity.id} data-testid={`activity-row-${activity.id}`} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <strong data-testid="activity-title">{activity.name}</strong>
                  <span className="rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-xs font-medium">{activity.activityType}</span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  List: {activity.wordList?.name || "Linked List"} · Difficulty: {activity.difficulty}
                  {activity.activityType === "WORD_SEARCH" ? ` (${activity.rows || 10}x${activity.cols || 10})` : ` (${activity.maxGuesses || 6} guesses)`}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <button onClick={() => generateSaved(activity.id)} data-testid={`generate-btn-${activity.id}`} className="rounded bg-[var(--primary)] px-2.5 py-1 text-xs font-semibold text-white hover:opacity-90">
                    Generate from database
                  </button>
                  <button onClick={() => editActivity(activity)} data-testid={`edit-act-btn-${activity.id}`} className="text-xs font-semibold text-[var(--primary)] hover:underline">
                    Edit Configuration
                  </button>
                  <button onClick={() => deleteActivity(activity.id)} data-testid={`delete-act-btn-${activity.id}`} className="text-xs font-semibold text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {!activities.length && <p className="text-sm text-[var(--text-muted)]">No saved activities yet.</p>}
          </div>
        </section>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">
        Observability Note: Activity generations trigger server-side metrics to <code>/api/telemetry</code> and update the live <Link className="font-semibold text-[var(--primary)]" href="/dashboard">Dashboard</Link>.
      </div>
    </div>
  );
}
