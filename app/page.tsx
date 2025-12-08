import ChessButton from "@/components/Button";
import WCCSims from "@/components/WCCSims";
import OlympiadSims from "@/components/OlympiadSims";

const heroStats = [
  { label: "Scenario sweeps", value: "150K+", detail: "per hour" },
  { label: "Signals tracked", value: "312", detail: "live feeds" },
  { label: "Archive depth", value: "12.4M", detail: "historic moves" },
];

const featurePanels = [
  {
    title: "Tournament futures",
    description:
      "Real-time Monte Carlo forecasts across world championships, Olympiads, and invitational events.",
  },
  {
    title: "Elocator complexity",
    description:
      "Neural heuristics translate raw FENs into a human-complexity index for single positions or entire games.",
  },
  {
    title: "Data-native storytelling",
    description:
      "Interactive visuals, streaming tables, and bespoke exports built for analysts, journalists, and seconds.",
  },
];

const intelBursts = [
  { title: "World Championship Pulse", cta: "Dive Deeper", href: "/simulations/fide-world-championship-singapore-2024" },
  { title: "Candidates Recon", cta: "View Report", href: "/simulations/candidates-2024" },
  { title: "Olympiad Medals", cta: "See Probabilities", href: "/simulations/chess-olympiad-budapest-2024" },
];

export default function Home() {
  return (
    <main className="relative overflow-hidden pb-24">
      <section className="container relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <p className="text-xs uppercase tracking-[0.6em] text-sand-muted">Analog chess intelligence lab</p>
          <h1 className="font-display text-5xl leading-tight text-sand md:text-6xl">
            Command the future of elite chess with cinematic analytics
          </h1>
          <p className="text-lg text-sand-muted">
            Pawnalyze is a retro-futurist control room for tournaments, federations, and seconds. It fuses simulations,
            probability engines, and Elocator complexity models into one tactile interface.
          </p>
          <div className="flex flex-wrap gap-4">
            <ChessButton text="Explore Simulations" link="/simulations" />
            <ChessButton text="Launch Elocator" link="/elocator" variant="secondary" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-5">
                <p className="text-xs uppercase tracking-[0.4em] text-sand-muted">{stat.label}</p>
                <p className="font-display text-3xl text-sand">{stat.value}</p>
                <p className="text-xs uppercase tracking-[0.4em] text-sand-muted">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel relative h-full rounded-4xl border border-white/10 p-6 shadow-subtle">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-sand-muted">
            <span>Signal 64</span>
            <span className="text-mint">Live feed</span>
          </div>
          <p className="mt-6 text-sm text-sand-muted">Championship confidence bands</p>
          <div className="mt-4 rounded-3xl border border-white/5 bg-black/30 p-4">
            <WCCSims justGraph={true} />
          </div>
        </div>
      </section>

      <section className="container mt-8 grid gap-6 md:grid-cols-3">
        {featurePanels.map((panel) => (
          <div key={panel.title} className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-amber">Capability</p>
            <h3 className="mt-2 font-display text-2xl text-sand">{panel.title}</h3>
            <p className="mt-3 text-sm text-sand-muted">{panel.description}</p>
          </div>
        ))}
      </section>

      <section className="container mt-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-4xl border border-white/10 bg-black/30 p-6 shadow-subtle">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Global medal radar</p>
              <h2 className="font-display text-3xl text-sand">Olympiad probability ribbon</h2>
            </div>
            <ChessButton text="Full dashboard" link="/simulations/chess-olympiad-budapest-2024" variant="secondary" />
          </div>
          <div className="mt-6 rounded-3xl border border-white/5 bg-white/5 p-4">
            <OlympiadSims showOnlyMedalChart={true} />
          </div>
        </div>
        <div className="space-y-4">
          {intelBursts.map((intel) => (
            <div key={intel.title} className="rounded-3xl border border-white/10 bg-gradient-to-r from-ink-soft to-black/40 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-sand-muted">Briefing</p>
              <h3 className="font-display text-xl text-sand">{intel.title}</h3>
              <ChessButton text={intel.cta} link={intel.href} variant="ghost" />
            </div>
          ))}
        </div>
      </section>

      <section className="container mt-20 rounded-4xl border border-white/10 bg-gradient-to-br from-ink-soft via-ink to-black/80 p-10 shadow-subtle">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Elocator</p>
            <h2 className="font-display text-4xl text-sand">Measure the human chaos inside any FEN</h2>
            <p className="mt-4 text-base text-sand-muted">
              Switch between single-position probes and full game sweeps. The Elocator model watches for volatility, swing
              potential, and the likelihood of errors given grandmaster precedent.
            </p>
            <div className="mt-6 flex gap-4">
              <ChessButton text="Analyze position" link="/elocator" />
              <ChessButton text="See broadcast" link="/elocator/broadcast" variant="secondary" />
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="space-y-3 text-sm text-sand-muted">
              <div className="flex items-center justify-between">
                <span>Complexity scale</span>
                <span className="font-display text-sand">1 -> 10</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-mint via-amber to-lava"></div>
              </div>
              <p>Dataset: 100K+ GM moves • Stockfish depth 20</p>
              <p>Use cases: prep, commentary, integrity checks</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
