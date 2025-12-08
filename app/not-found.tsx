'use client'
import Link from "next/link";

export default function Custom404() {
  return (
    <main className="page-shell">
      <div className="glass-panel space-y-6 p-10 text-center">
        <span className="tag-pill mx-auto">404</span>
        <h1 className="font-display text-4xl uppercase tracking-[0.35em] text-paper">Signal not found</h1>
        <p className="text-slate">
          The board you&apos;re after moved. Head back to the control room or browse the archives.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm uppercase tracking-[0.35em] text-paper">
          <Link href="/" className="rounded-full border border-white/15 px-5 py-2">
            Home
          </Link>
          <a href="https://blog.pawnalyze.com/" className="rounded-full border border-white/15 px-5 py-2" target="_blank" rel="noreferrer">
            Visit the journal
          </a>
        </div>
      </div>
    </main>
  );
}