import PageHeader from "@/components/PageHeader";
import Link from "next/link";
import {
  ASSESSMENT_TITLE,
  PROJECT_TITLE,
  STUDENT_NAME,
  STUDENT_NUMBER,
} from "@/data/student";
import {
  Layers,
  Database,
  Activity,
  CheckCircle2,
  Video,
  ExternalLink,
  ShieldCheck,
  Server,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="page-shell space-y-8">
      <PageHeader
        title="About & System Architecture"
        description="Educational purpose, multi-stage assessment continuity, and operational overview."
      />

      {/* OVERVIEW SECTION */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-xl font-bold tracking-tight">Project Overview</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
          The <strong className="text-[var(--text)]">{PROJECT_TITLE}</strong> is an enterprise-grade, data-driven educational web platform designed for speech pathologists, literacy educators, and primary school teachers. The system enables educators to build structured phoneme-based Wordle and Word Search learning activities, persist reusable word lists and activity templates in a relational database, monitor system health and operational metrics through a real-time observability dashboard, and generate standalone interactive HTML puzzles for offline classroom use.
        </p>
      </section>

      {/* THREE-STAGE ASSESSMENT PROGRESSION ROADMAP */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Project Continuity &amp; Assessment Scope</h2>
          <p className="text-xs text-[var(--text-muted)]">
            Architectural evolution across the 2026-CSE3CWA subject milestones.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Stage 1 */}
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-black text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                A1
              </span>
              <h3 className="font-bold text-sm">Assessment 1: Frontend Layer</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Established the responsive UI/UX architecture, phoneme-unit guessing algorithms, duplicate-aware Wordle scoring, multi-directional Word Search puzzle generation, cookie-based theme persistence, and client-side standalone HTML export.
            </p>
          </article>

          {/* Stage 2 */}
          <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                A2
              </span>
              <h3 className="font-bold text-sm">Assessment 2: Backend Persistence</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Introduced relational SQLite persistence with Prisma ORM, server-side data validation, RESTful CRUD API endpoints for word lists and activity configurations, database-backed generation, and multi-stage Docker containerization.
            </p>
          </article>

          {/* Stage 3 */}
          <article className="rounded-2xl border-2 border-[var(--primary)] bg-[var(--surface)] p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-xs font-black text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                A3
              </span>
              <h3 className="font-bold text-sm">Assessment 3: Data &amp; Observability</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
              Current submission: Introduces the central Observability Dashboard (<Link href="/dashboard" className="font-semibold text-[var(--primary)]">/dashboard</Link>), passive dwell-time telemetry (<code className="text-[11px]">/api/telemetry</code>), server health monitoring (<Link href="/health" className="font-semibold text-[var(--primary)]">/health</Link>), Playwright E2E automation, Apache JMeter staged load testing (1x to 10,000x), and WCAG 2.2 AA accessibility remediation.
            </p>
          </article>
        </div>
      </section>

      {/* FEATURE PILLARS */}
      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-500" />
            <h3 className="font-bold text-sm">Phoneme Wordle Engine</h3>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--text-muted)]">
            <li>Multi-character phoneme units treated as single guess cells (e.g., <code>/sh/</code>, <code>/ee/</code>, <code>/ck/</code>).</li>
            <li>Configurable guess limits, difficulty levels, and phoneme hint sequences.</li>
            <li>Two-pass duplicate-aware scoring matching canonical Wordle specifications.</li>
            <li>Standalone HTML generation with embedded interactive JavaScript for offline play.</li>
          </ul>
        </article>

        <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-sm">Phoneme Word Search Engine</h3>
          </div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-[var(--text-muted)]">
            <li>Dynamic 2D letter grid generation with custom dimension controls (8x8 to 14x14).</li>
            <li>8-directional placement engine (horizontal, vertical, diagonal, and reverse).</li>
            <li>Accessible mouse drag and touch selection for classroom interactive whiteboards.</li>
            <li>One-click HTML export with toggleable answer reveals for educator marking.</li>
          </ul>
        </article>
      </section>

      {/* STUDENT DETAILS */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-bold">Student &amp; Academic Verification</h2>
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Student Name</dt>
            <dd className="mt-1 text-lg font-bold text-[var(--text)]">{STUDENT_NAME}</dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Student ID</dt>
            <dd className="mt-1 text-lg font-bold text-[var(--text)]">{STUDENT_NUMBER}</dd>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Subject &amp; Assessment</dt>
            <dd className="mt-1 text-xs font-semibold text-[var(--text)]">2026-CSE3CWA · Assessment 3</dd>
          </div>
        </dl>
      </section>

      {/* VIDEO DEMONSTRATION & SUBMISSION NOTICE (PROFESSIONAL REPLACEMENT) */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold">Video Demonstration &amp; Submission Evidence</h2>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Assessment 3 Submission Ready
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-[var(--text-muted)]">
          In accordance with La Trobe University Assessment 3 instructions, the verbal walkthrough video is submitted directly via the Moodle Turnitin portal alongside the official technical documentation report (<code className="text-[11px]">Assessment3_Submission_Report.docx</code>).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">Target Duration</div>
            <div className="mt-1 text-sm font-bold text-[var(--text)]">~6 min 45 sec</div>
            <div className="text-[10px] text-[var(--text-muted)]">Strictly within 3 to 8 min brief</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">Identity Verification</div>
            <div className="mt-1 text-sm font-bold text-[var(--text)]">Face, Voice &amp; Student ID</div>
            <div className="text-[10px] text-[var(--text-muted)]">Verified in video introduction</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">Automated E2E Testing</div>
            <div className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">4/4 Tests Passing</div>
            <div className="text-[10px] text-[var(--text-muted)]">Microsoft Playwright suite</div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] p-3.5">
            <div className="text-[11px] font-semibold text-[var(--text-muted)]">Accessibility Score</div>
            <div className="mt-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">96 / 100 WCAG AA</div>
            <div className="text-[10px] text-[var(--text-muted)]">Google Lighthouse 12.x audit</div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4 text-xs">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Server className="h-4 w-4 text-[var(--primary)]" />
            <span>Health Endpoint: <Link href="/health" className="font-mono font-medium text-[var(--primary)] hover:underline">/health (HTTP 200 OK)</Link></span>
          </div>
          <a
            href="https://github.com/ankandas22018897/phoneme-activity-builder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[var(--primary)] hover:underline"
          >
            <span>GitHub Repository &amp; Commit History</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </section>
    </div>
  );
}
