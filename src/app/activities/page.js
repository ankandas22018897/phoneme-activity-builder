"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { generateWordleHtml, generateWordSearchHtml } from "@/lib/htmlGenerator";
import { buildWordSearchPuzzle } from "@/lib/wordSearchLogic";

const emptyWord = { english: "", phonemes: "" };

export default function ActivitiesPage() {
  const [lists, setLists] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
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
    setLists(await listsRes.json());
    setActivities(await activitiesRes.json());
  }

  useEffect(() => { load().catch((e) => setError(e.message)); }, []);

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
    setWords(data.words.map((w) => ({ english: w.english, phonemes: w.phonemes.join(" ") })));
  }

  async function deleteList(id) {
    if (!window.confirm("Delete this word list and its linked activities?")) return;
    const response = await fetch(`/api/word-lists/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not delete word list.");
    if (selectedList?.id === id) { setSelectedList(null); setName(""); setDescription(""); setWords([{ ...emptyWord }]); }
    setMessage("Word list deleted."); await load();
  }

  async function saveActivity(event) {
    event.preventDefault(); setError(""); setMessage("");
    if (!selectedList) return setError("Save or select a word list before creating an activity.");
    const response = await fetch("/api/activities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: activityName, activityType, difficulty, wordListId: selectedList.id, maxGuesses, hintsEnabled, rows, cols, outputTitle: activityName }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not save activity.");
    setMessage("Activity configuration saved to the database."); setActivityName(""); await load();
  }

  async function deleteActivity(id) {
    const response = await fetch(`/api/activities/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) return setError(data.error || "Could not delete activity.");
    setMessage("Activity deleted."); await load();
  }

  async function generateSaved(id) {
    setError("");
    try {
      const response = await fetch(`/api/activities/${id}`);
      const activity = await response.json();
      if (!response.ok) throw new Error(activity.error || "Could not load activity.");
      const targetWords = activity.wordList.words.map((w) => ({ phonemes: w.phonemes, english: w.english }));
      let html;
      if (activity.activityType === "WORDLE") {
        html = generateWordleHtml({ targets: targetWords.slice(0, Math.min(targetWords.length, 5)), maxGuesses: activity.maxGuesses, hintsEnabled: activity.hintsEnabled, title: activity.outputTitle || activity.name });
      } else {
        const items = targetWords.map((w) => ({ units: w.phonemes, key: w.phonemes.join(""), display: w.phonemes.join(" ") }));
        const built = buildWordSearchPuzzle(items, activity.rows || 10, activity.cols || 10);
        if (!built.ok) throw new Error(built.error);
        html = generateWordSearchHtml({ ...built.puzzle, title: activity.outputTitle || activity.name });
      }
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = activity.activityType === "WORDLE" ? "phoneme-wordle.html" : "phoneme-word-search.html"; anchor.click(); URL.revokeObjectURL(url);
      setMessage(`Generated HTML from stored ${activity.activityType === "WORDLE" ? "Wordle" : "Word Search"} data.`);
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="page-shell space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">Assessment 2 backend</p>
        <h1 className="mt-1 text-3xl font-bold">Saved Activities &amp; Database</h1>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">Create, read, update and delete phoneme word lists and activity settings. Saved configurations are loaded from the backend and can generate downloadable HTML.</p>
      </header>
      {error && <p className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-100" role="alert">{error}</p>}
      {message && <p className="rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:bg-green-950 dark:text-green-100" role="status">{message}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-xl font-bold">1. Word list CRUD</h2>
          <form onSubmit={saveList} className="mt-4 space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Word list name" required className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={2} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            <div className="space-y-2">
              {words.map((word, index) => <div key={index} className="grid grid-cols-[1fr_1.4fr_auto] gap-2">
                <input value={word.english} onChange={(e) => updateWord(index, "english", e.target.value)} placeholder="English" className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2" />
                <input value={word.phonemes} onChange={(e) => updateWord(index, "phonemes", e.target.value)} placeholder="e.g. ʃ ɪ p" className="rounded-lg border border-[var(--border)] bg-transparent px-2 py-2 font-mono" />
                <button type="button" onClick={() => removeWordRow(index)} className="rounded-lg border border-[var(--border)] px-3">×</button>
              </div>)}
            </div>
            <div className="flex gap-2"><button type="button" onClick={addWordRow} className="rounded-lg border border-[var(--border)] px-3 py-2">+ Add word</button><button className="rounded-lg bg-[var(--primary)] px-4 py-2 font-semibold text-white">{selectedList ? "Update list" : "Save list"}</button></div>
          </form>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{wordCount} word(s) in the editor.</p>
          <div className="mt-5 space-y-2">
            {lists.map((list) => <div key={list.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border)] p-3"><span><strong>{list.name}</strong><span className="ml-2 text-xs text-[var(--text-muted)]">{list._count.words} words</span></span><span className="flex gap-2"><button onClick={() => editList(list.id)} className="text-sm font-semibold text-[var(--primary)]">Edit</button><button onClick={() => deleteList(list.id)} className="text-sm font-semibold text-red-600">Delete</button></span></div>)}
            {!lists.length && <p className="text-sm text-[var(--text-muted)]">No saved lists yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-xl font-bold">2. Activity configuration</h2>
          <form onSubmit={saveActivity} className="mt-4 space-y-3">
            <input value={activityName} onChange={(e) => setActivityName(e.target.value)} placeholder="Activity name" required className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />
            <select value={selectedList?.id || ""} onChange={(e) => editList(Number(e.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"><option value="">Select stored word list</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select>
            <div className="grid grid-cols-2 gap-2"><select value={activityType} onChange={(e) => setActivityType(e.target.value)} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"><option value="WORDLE">Wordle</option><option value="WORD_SEARCH">Word Search</option></select><select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2"><option>easy</option><option>medium</option><option>hard</option></select></div>
            {activityType === "WORD_SEARCH" && <div className="grid grid-cols-2 gap-2"><input type="number" min="5" max="20" value={rows} onChange={(e) => setRows(Number(e.target.value))} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" /><input type="number" min="5" max="20" value={cols} onChange={(e) => setCols(Number(e.target.value))} className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" /></div>}
            {activityType === "WORDLE" && <input type="number" min="3" max="10" value={maxGuesses} onChange={(e) => setMaxGuesses(Number(e.target.value))} className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2" />}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={hintsEnabled} onChange={(e) => setHintsEnabled(e.target.checked)} /> Enable phoneme hints</label>
            <button className="w-full rounded-lg bg-[var(--primary)] px-4 py-2.5 font-semibold text-white">Save activity configuration</button>
          </form>
          <div className="mt-5 space-y-2">
            {activities.map((activity) => <div key={activity.id} className="rounded-lg border border-[var(--border)] p-3"><div className="flex items-center justify-between gap-2"><strong>{activity.name}</strong><span className="rounded-full bg-[var(--surface-muted)] px-2 py-1 text-xs">{activity.activityType}</span></div><p className="mt-1 text-sm text-[var(--text-muted)]">List: {activity.wordList.name} · {activity.difficulty}</p><div className="mt-2 flex gap-3"><button onClick={() => generateSaved(activity.id)} className="text-sm font-semibold text-[var(--primary)]">Generate from database</button><button onClick={() => deleteActivity(activity.id)} className="text-sm font-semibold text-red-600">Delete</button></div></div>)}
            {!activities.length && <p className="text-sm text-[var(--text-muted)]">No saved activities yet.</p>}
          </div>
        </section>
      </div>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--text-muted)]">Backend demo: <code>GET /api/health</code> checks the database connection. The existing <Link className="font-semibold text-[var(--primary)]" href="/wordle">Wordle</Link> and <Link className="font-semibold text-[var(--primary)]" href="/word-search">Word Search</Link> builders remain available for activity design.</div>
    </div>
  );
}
