import WordleBuilder from "@/components/WordleBuilder";

export default function WordlePage() {
  return (
    <div className="page-shell">
      <h1 className="mb-6 text-center text-3xl font-bold text-[#2b5c8f] dark:text-[var(--primary)]">
        Phoneme Wordle
      </h1>
      <WordleBuilder />
    </div>
  );
}
