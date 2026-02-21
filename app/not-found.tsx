import Link from "next/link"

export default function Custom404() {
    return (
        <main className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4">
            <h1 className="font-heading text-6xl text-[var(--text-primary)] mb-4">404</h1>
            <p className="text-xl text-[var(--text-muted)] mb-6">Page not found</p>
            <div className="flex items-center gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-chess-gold text-chess-dark font-semibold px-6 py-2.5 rounded-lg hover:bg-chess-gold-light hover:shadow-gold transition-all"
                >
                    Go home
                </Link>
                <Link
                    href="https://blog.pawnalyze.com/"
                    className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--text-secondary)] font-medium px-6 py-2.5 rounded-lg hover:text-chess-gold hover:border-chess-gold/30 transition-colors"
                >
                    Visit blog
                </Link>
            </div>
        </main>
    )
}
