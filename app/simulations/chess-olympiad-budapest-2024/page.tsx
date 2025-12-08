import OlympiadSims from "@/components/OlympiadSims";
import TournamentInfo from "@/components/TournamentInfo";

const Sims = () => {
  return (
    <main className="container space-y-12 py-16">
      <section className="space-y-4">
        <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Event dossier</p>
        <TournamentInfo
          name="Chess Olympiad Budapest 2024"
          website="https://chessolympiad2024.fide.com/"
          description="Global 4-board mayhem that crowns the strongest federation on earth."
          format="11 rounds • team Swiss"
        />
      </section>
      <section className="rounded-4xl border border-white/10 bg-black/30 p-6 shadow-subtle">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Live medal radar</p>
            <h2 className="font-display text-3xl text-sand">Probability ribbon</h2>
          </div>
          <p className="text-sm text-sand-muted">Updated after every round with 5,000 reruns.</p>
        </div>
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <OlympiadSims />
        </div>
      </section>
      <section className="space-y-4 rounded-4xl border border-white/10 bg-black/20 p-6 text-sand-muted">
        <h3 className="font-display text-2xl text-sand">How the Olympiad model works</h3>
        <p>
          Before the first pawn moved we ran 5,000 Monte Carlo simulations to build priors for every country. After each
          official pairing list drops we rerun the full tree with FIDE&apos;s color rules, Swiss pairings, and medal cutoffs.
        </p>
        <p>
          White allocation is randomized when teams have identical color histories, which mirrors the official drawing of
          lots. The differences are microscopic but worth noting if you scrutinize pairing edge cases.
        </p>
        <p>
          Deeper technical notes live on our{" "}
          <a
            href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
            className="text-mint"
            target="_blank"
            rel="noreferrer"
          >
            blog
          </a>{" "}
          and the core scripts are open on{" "}
          <a
            href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py"
            className="text-mint"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
        <p className="text-sm text-amber/80">
          Note: appearing in the table means a country won at least one simulated medal, even if the percentage displays as
          0.0.
        </p>
      </section>
    </main>
  );
};
export default Sims;
