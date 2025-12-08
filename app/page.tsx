import ChessButton from "@/components/Button";
import OlympiadSims from "@/components/OlympiadSims";
import WCCSims from "@/components/WCCSims";
import Link from "next/link";

const statBlocks = [
  { label: "Monte Carlo scenarios", value: "62,000+" },
  { label: "Live tournaments tracked", value: "11" },
  { label: "Complexity FENs analyzed", value: "120k" },
];

const labFeatures = [
  {
    title: "Scenario forensics",
    desc: "Pin wins, draws, or collapses. Re-run the entire championship tree in seconds.",
    link: "/simulations",
  },
  {
    title: "Complexity lens",
    desc: "Elocator scores human volatility using millions of grandmaster decisions.",
    link: "/elocator",
  },
  {
    title: "Streaming dashboards",
    desc: "Broadcast-ready cards, medal projections, and win paths that refresh in real time.",
    link: "https://blog.pawnalyze.com",
  },
];

export default function Home() {
  return (
    <main className="page-shell">
      <section className="hero-grid gap-12">
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="tag-pill">Neo-deco command room</span>
            <h1 className="text-balance font-display text-4xl uppercase tracking-[0.35em] text-paper sm:text-5xl">
              Chess probability, architected for obsessives.
            </h1>
            <p className="text-lg text-slate">
              Pawnalyze is a midnight control room for the world&apos;s loudest chess events—live simulation arcs, medal
              tables, and human-readable complexity stitched into one surface.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <ChessButton text="Run simulations" link="/simulations" />
            <ChessButton text="Explore elocator" link="/elocator" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {statBlocks.map((stat) => (
              <div key={stat.label} className="stat-card">
                <strong>{stat.value}</strong>
                <span className="block text-xs uppercase tracking-[0.4em]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-panel hero-aurora p-6">
          <div className="panel-heading">
            <div>
              <p className="text-xs uppercase tracking-[0.6em] text-slate">Live // Singapore</p>
              <h2 className="text-2xl text-paper">World Championship win paths</h2>
            </div>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.35em] text-slate">
              realtime
            </span>
          </div>
          <div className="mt-4 h-[360px] w-full rounded-2xl border border-white/10 bg-black/20 p-2">
            <WCCSims justGraph />
          </div>
        </div>
      </section>

      <section className="panel-grid">
        <div className="panel-heading">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate">Pawnalyze labs</p>
            <h2 className="text-3xl font-display uppercase tracking-[0.35em] text-paper">How we see the board</h2>
          </div>
        </div>
        <div className="split-panel">
          {labFeatures.map((feature) => {
            const isExternal = feature.link.startsWith("http");
            return (
              <div key={feature.title} className="glass-panel accent-border p-6">
                <p className="text-sm uppercase tracking-[0.5em] text-mint/80">{feature.title}</p>
                <p className="mt-3 text-slate">{feature.desc}</p>
                {isExternal ? (
                  <a
                    href={feature.link}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-paper"
                  >
                    Enter
                    <span aria-hidden className="inline-block h-[1px] w-8 bg-gradient-to-r from-mint to-brass" />
                  </a>
                ) : (
                  <Link
                    href={feature.link}
                    className="mt-6 inline-flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-paper"
                  >
                    Enter
                    <span aria-hidden className="inline-block h-[1px] w-8 bg-gradient-to-r from-mint to-brass" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="glass-panel p-6">
        <div className="panel-heading">
          <div>
            <p className="text-xs uppercase tracking-[0.6em] text-slate">Medal race</p>
            <h2 className="text-2xl text-paper">Budapest Olympiad pulse</h2>
          </div>
          <span className="text-xs text-slate">Top 8 chances</span>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-2">
          <OlympiadSims showOnlyMedalChart />
        </div>
      </section>
    </main>
  );
}
