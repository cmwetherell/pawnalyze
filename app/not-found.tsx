import Link from "next/link";

export default function Custom404() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-transparent px-6 text-center">
      <div className="rounded-4xl border border-white/10 bg-black/30 px-10 py-12 shadow-subtle">
        <p className="text-xs uppercase tracking-[0.6em] text-sand-muted">404</p>
        <h1 className="mt-4 font-display text-4xl text-sand">Board not found</h1>
        <p className="mt-3 text-sand-muted">The line you followed fizzled out. Let&apos;s re-route you.</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/" className="text-mint transition hover:text-amber">
            Return to the console ->
          </Link>
          <Link
            href="https://blog.pawnalyze.com/"
            className="text-sand-muted transition hover:text-amber"
            target="_blank"
            rel="noreferrer"
          >
            Looking for the legacy blog?
          </Link>
        </div>
      </div>
    </main>
  );
}
