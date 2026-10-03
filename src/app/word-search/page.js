import WordSearchBuilder from "@/components/WordSearchBuilder";

export default function WordSearchPage() {
  return (
    <div className="page-shell">
      <h1 className="mb-6 text-center text-3xl font-bold text-[#2b5c8f] dark:text-[var(--primary)]">
        Phoneme Word Search
      </h1>
      <WordSearchBuilder />
    </div>
  );
}
