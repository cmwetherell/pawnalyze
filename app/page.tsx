import Link from "next/link";
import Image from "next/image";
import GetPredictions from "@/components/currentPredictions";
import { getBaseSimulationData } from "@/lib/simulations";

export default async function Home() {
  const initialData = await getBaseSimulationData('candidates_2026');
  return (
    <main className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Chess grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-conic-gradient(var(--text-primary) 0% 25%, transparent 0% 50%)`,
          backgroundSize: '40px 40px',
        }} />
        {/* Fade out checkerboard at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--bg-base)] to-transparent" />
        {/* Gold gradient orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-chess-gold/5 blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <p className="text-chess-gold-dark dark:text-chess-gold text-sm font-semibold tracking-widest uppercase mb-4">
            Chess Analytics & Predictions
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)] mb-4">
            Predictive analytics for{' '}
            <span className="gold-gradient-text">championship chess</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
            Monte Carlo tournament simulations, interactive scenario building,
            and AI-powered position complexity analysis.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/simulations"
              className="inline-flex items-center gap-2 bg-chess-gold text-chess-dark font-semibold px-6 py-3 rounded-lg hover:bg-chess-gold-light hover:shadow-gold transition-all"
            >
              Explore Simulations
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/elocator"
              className="inline-flex items-center gap-2 border border-[var(--border)] text-[var(--text-primary)] font-semibold px-6 py-3 rounded-lg hover:border-chess-gold/40 hover:text-chess-gold transition-all"
            >
              Try Elocator
            </Link>
          </div>

          {/* As featured in */}
          <div className="mt-14 text-[var(--text-secondary)]">
            <p className="text-xs uppercase tracking-wider text-center mb-5">As seen in</p>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Image
                src="/img/nyt-logo.svg"
                alt="The New York Times"
                width={540}
                height={85}
                className="h-8 w-auto dark:invert dark:opacity-60"
              />
              <Image
                src="/img/npr-logo.svg"
                alt="NPR"
                width={80}
                height={30}
                className="h-7 w-auto"
              />
              <Image
                src="/img/japantimes-logo.svg"
                alt="The Japan Times"
                width={310}
                height={45}
                className="h-6 w-auto dark:invert dark:opacity-60"
              />
              <Image
                src="/img/gulfnews-logo.svg"
                alt="Gulf News"
                width={340}
                height={40}
                className="h-6 w-auto dark:invert dark:opacity-60"
              />
<Image
                src="/img/deccanherald-logo.svg"
                alt="Deccan Herald"
                width={320}
                height={40}
                className="h-5 w-auto dark:invert dark:opacity-60"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Predictions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse-live" />
            Live
          </span>
          <h2 className="font-heading text-2xl text-[var(--text-primary)]">
            2026 Candidates Tournament
          </h2>
        </div>
        <div className="surface-card p-4 sm:p-6">
          <GetPredictions
            nsims={10000}
            gameFilters={[]}
            updateTrigger={0}
            eventTable="candidates_2026"
            initialData={initialData}
          />
        </div>
        <div className="mt-4 text-right">
          <Link
            href="/simulations/candidates-2026"
            className="text-sm text-chess-gold hover:text-chess-gold-light transition-colors"
          >
            Full simulation with Scenario Builder &rarr;
          </Link>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/simulations" className="group surface-card p-6 hover:border-chess-gold/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg text-[var(--text-primary)] mb-2">Tournament Simulations</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">
              Over one million Monte Carlo simulations for the Candidates Tournament.
              Build custom scenarios and watch probabilities shift in real time.
            </p>
            <span className="text-sm text-chess-gold group-hover:translate-x-1 transition-transform inline-block">
              View simulations &rarr;
            </span>
          </Link>

          <Link href="/elocator" className="group surface-card p-6 hover:border-chess-gold/30 transition-all">
            <div className="w-10 h-10 rounded-lg bg-chess-gold/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-chess-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg text-[var(--text-primary)] mb-2">Elocator</h3>
            <p className="text-sm text-[var(--text-muted)] mb-3">
              AI-powered position complexity analysis. Paste a FEN or PGN to discover
              how challenging a position is for human players.
            </p>
            <span className="text-sm text-chess-gold group-hover:translate-x-1 transition-transform inline-block">
              Analyze a position &rarr;
            </span>
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full pb-20">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="surface-card p-6">
            <Image
              src="/img/nyt-logo.svg"
              alt="The New York Times"
              width={540}
              height={85}
              className="h-[30px] w-auto mb-3 dark:invert"
            />
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              &ldquo;Statistical analysis by Pawnalyze showed that Mr. Niemann had consistently
              outperformed his rating strength to an astonishing degree.&rdquo;
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              &mdash; &ldquo;The Chess World Isn&apos;t Ready for a Cheating Scandal,&rdquo; Sept. 2022
            </p>
          </div>
          <div className="surface-card p-6">
            <Image
              src="/img/npr-logo.svg"
              alt="NPR"
              width={60}
              height={24}
              className="h-9 w-auto mb-3"
            />
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Pawnalyze founder Caleb Wetherell was interviewed on Weekend Edition Saturday
              about the Niemann&ndash;Carlsen cheating controversy and his statistical analysis
              of Niemann&apos;s unprecedented rating rise.
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              &mdash; Weekend Edition Saturday with Scott Simon, Sept. 2022
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
