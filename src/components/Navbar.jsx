"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { PROJECT_TITLE, ASSESSMENT_TITLE } from "@/data/student";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wordle", label: "Wordle" },
  { href: "/word-search", label: "Word Search" },
  { href: "/activities", label: "Saved Data" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
];


export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function NavLink({ link, mobile = false }) {
    const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
    return <Link href={link.href} onClick={() => setOpen(false)} className={mobile ? `block rounded-lg px-3 py-3 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${active ? "bg-white font-semibold text-[#1d4f7c]" : "text-white hover:bg-white/15"}` : `rounded-lg px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${active ? "bg-white font-semibold text-[#1d4f7c]" : "text-white/90 hover:bg-white/15 hover:text-white"}`} aria-current={active ? "page" : undefined}>{link.label}</Link>;
  }

  return <header className="sticky top-0 z-40 border-b border-[#163d5f] bg-[#1d4f7c] text-white shadow-sm">
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="min-w-0 text-white"><p className="text-xs font-semibold uppercase tracking-wide text-[#dbeafe]">{ASSESSMENT_TITLE}</p><Link href="/" onClick={() => setOpen(false)} className="block truncate text-lg font-bold text-white">{PROJECT_TITLE}</Link></div>
      <nav className="hidden items-center gap-1 text-white md:flex" aria-label="Primary">{LINKS.map((link) => <NavLink key={link.href} link={link} />)}<ThemeToggle className="ml-2 border-white/40 bg-white/15 text-white hover:bg-white/25" /></nav>
      <div className="flex items-center gap-2 text-white md:hidden"><ThemeToggle className="border-white/40 bg-white/15 text-white hover:bg-white/25" /><button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/50 text-white" aria-expanded={open} aria-controls={menuId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((v) => !v)}><span aria-hidden="true" className="text-xl leading-none">{open ? "×" : "≡"}</span></button></div>
    </div>
    {open ? <nav id={menuId} className="border-t border-white/25 bg-[#163d5f] px-4 py-3 text-white md:hidden" aria-label="Mobile"><ul className="flex flex-col gap-1">{LINKS.map((link) => <li key={link.href}><NavLink link={link} mobile /></li>)}</ul></nav> : null}
  </header>;
}
