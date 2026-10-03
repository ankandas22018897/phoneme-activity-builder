import Link from "next/link";

export default function ActivityCard({
  title,
  description,
  href,
  cta = "Create activity",
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
      <h2 className="text-xl font-bold text-[var(--text)]">{title}</h2>
      <p className="mt-2 flex-1 text-[var(--text-muted)]">{description}</p>
      <Link
        href={href}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)]"
      >
        {cta}
      </Link>
    </article>
  );
}
