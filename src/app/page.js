import Link from "next/link";
import ActivityCard from "@/components/ActivityCard";
import PageHeader from "@/components/PageHeader";
import { PROJECT_TITLE } from "@/data/student";

export default function HomePage() {
  return (
    <div className="page-shell">
      <PageHeader
        title="Create Phoneme-Based Classroom Activities"
        description="A teacher-focused tool for creating Wordle-style and Word Search activities using HCE phoneme symbols."
      />

      <section className="mb-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="text-xl font-bold text-[var(--text)]">{PROJECT_TITLE}</h2>
        <p className="mt-2 max-w-3xl text-[var(--text-muted)]">
          Designed for Speech Pathology teachers who need quick, printable-style
          digital activities that students can open in any browser. Build the
          activity here, preview it, then download a standalone HTML file — no
          server required for play.
        </p>
        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm font-semibold text-[var(--text)]">Purpose</dt>
            <dd className="mt-1 text-sm text-[var(--text-muted)]">
              Practise phoneme awareness with classroom-ready games.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text)]">
              Target users
            </dt>
            <dd className="mt-1 text-sm text-[var(--text-muted)]">
              Speech Pathology teachers and educators.
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text)]">Output</dt>
            <dd className="mt-1 text-sm text-[var(--text-muted)]">
              Offline standalone HTML for Wordle or Word Search.
            </dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ActivityCard
          title="Phoneme Wordle"
          description="Choose a phoneme target word, set guesses and hints, preview the game, then generate a downloadable Wordle activity."
          href="/wordle"
          cta="Create Wordle"
        />
        <ActivityCard
          title="Phoneme Word Search"
          description="Assemble a phoneme word list, configure the grid, preview mouse and touch play, then download a Word Search activity."
          href="/word-search"
          cta="Create Word Search"
        />
      </section>

      <p className="mt-8 text-sm text-[var(--text-muted)]">
        New here? Read the{" "}
        <Link
          href="/about"
          className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          About
        </Link>{" "}
        page for workflow details, or adjust appearance in{" "}
        <Link
          href="/settings"
          className="font-semibold text-[var(--primary)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
        >
          Settings
        </Link>
        .
      </p>
    </div>
  );
}
