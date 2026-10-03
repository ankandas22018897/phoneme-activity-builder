import {
  ASSESSMENT_TITLE,
  STUDENT_NAME,
  STUDENT_NUMBER,
} from "@/data/student";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#cbd5e1] bg-white dark:border-[#475569] dark:bg-[#1e293b]">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-5 text-sm text-[#475569] sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-[#cbd5e1]">
        <div>
          <p className="font-semibold text-[#0f172a] dark:text-[#f8fafc]">
            {STUDENT_NAME}
          </p>
          <p>{STUDENT_NUMBER}</p>
        </div>
        <p className="text-[#334155] dark:text-[#e2e8f0]">{ASSESSMENT_TITLE}</p>
      </div>
    </footer>
  );
}
