import PageHeader from "@/components/PageHeader";
import {
  ASSESSMENT_TITLE,
  PROJECT_TITLE,
  STUDENT_NAME,
  STUDENT_NUMBER,
} from "@/data/student";

export default function AboutPage() {
  return (
    <div className="page-shell space-y-6">
      <PageHeader
        title="About"
        description="What this assessment tool does and who it is for."
      />

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">What this project is</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          {PROJECT_TITLE} ({ASSESSMENT_TITLE}) is a frontend-only teaching tool.
          Teachers configure phoneme-based Wordle and Word Search activities,
          preview them in the browser, and download standalone HTML files for
          classroom use.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold">Designed for</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Speech Pathology teachers and educators who work with HCE phoneme
            symbols and need simple, accessible classroom activities.
          </p>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold">Purpose</h2>
          <p className="mt-2 text-[var(--text-muted)]">
            Support phoneme awareness practice without requiring a login,
            database, or internet connection once the HTML file is generated.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold">Wordle functionality</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>Phoneme-unit target words (multi-character symbols count as one cell)</li>
            <li>Configurable guesses and optional hints</li>
            <li>Correct / present / absent feedback</li>
            <li>English equivalence shown when the answer is correct</li>
            <li>Live preview and standalone HTML export</li>
          </ul>
        </article>
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-lg font-bold">Word Search functionality</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--text-muted)]">
            <li>About five phoneme words in a generated puzzle</li>
            <li>Horizontal, vertical, diagonal, and reverse placement</li>
            <li>Mouse and touch selection</li>
            <li>Optional answer reveal and HTML export</li>
          </ul>
        </article>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Assessment scope</h2>
        <p className="mt-2 text-[var(--text-muted)]">
          Assessment 1 is frontend-focused. This application does not include a
          backend, database, authentication, or cloud storage. Generated
          activities are self-contained HTML documents that open directly in a
          normal web browser.
        </p>
      </section>

      <section className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Student details</h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-[var(--text-muted)]">Name</dt>
            <dd className="text-xl font-bold text-[var(--text)]">{STUDENT_NAME}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--text-muted)]">
              Student number
            </dt>
            <dd className="text-xl font-bold text-[var(--text)]">{STUDENT_NUMBER}</dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Replace the placeholders in <code>src/data/student.js</code> before
          submission and recording your video.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">How to use this website (video)</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          The assessment requires a short video explaining how to use the
          website. Add your recording below (upload a file to{" "}
          <code>public/</code> or paste an embed). Do not invent a fake URL.
        </p>
        <div
          className="mt-4 flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 text-center text-sm text-[var(--text-muted)]"
          role="region"
          aria-label="Instructional video placeholder"
        >
          <p className="font-semibold text-[var(--text)]">Video placeholder</p>
          <p>
            Example after you add a file:{" "}
            <code className="text-xs">&lt;video controls src=&quot;/your-demo.mp4&quot; /&gt;</code>
          </p>
        </div>
      </section>
    </div>
  );
}
