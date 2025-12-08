import OlympiadSims from "@/components/OlympiadSims";
import TournamentInfo from "@/components/TournamentInfo";

const Sims: any = () => {
  return (
    <main className="page-shell space-y-10">
      <section className="glass-panel space-y-4 p-6">
        <span className="tag-pill">Budapest 2024</span>
        <h1 className="font-display text-3xl uppercase tracking-[0.35em] text-paper">
          Congrats to India for sweeping gold in both events.
        </h1>
        <TournamentInfo
          name="Chess Olympiad Budapest 2024"
          website="https://chessolympiad2024.fide.com/"
          description="Nations face off over eleven Swiss rounds to crown the strongest chess federation."
          format="11 rounds of 4v4 team battles"
        />
      </section>

      <section className="glass-panel p-6">
        <div className="panel-heading">
          <h2 className="text-2xl font-display uppercase tracking-[0.35em] text-paper">Live medal simulations</h2>
        </div>
        <div className="mt-4"><OlympiadSims /></div>
      </section>

      <section className="glass-panel space-y-4 p-6 text-slate">
        <h3 className="text-center text-xl font-display uppercase tracking-[0.35em] text-paper">What am I looking at?</h3>
        <p>
          Before the first pawn moved we ran 5,000 simulations to pin the baseline medal chances. After each round the
          engine ingests fresh results, follows the official FIDE pairing rules, and reruns the Monte Carlo stack with the
          updated field.
        </p>
        <p>
          Tracking color allocation, board order, and tie-break edge cases is surprisingly gnarly—when two squads have
          equal white counts we randomize who gets board-one white. It barely nudges odds, but highlights how intricate the
          Olympiad pairing tree really is.
        </p>
        <p>
          Dive deeper into the simulation logic in{" "}
          <a
            className="text-mint"
            href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
            target="_blank"
            rel="noreferrer"
          >
            this technical breakdown
          </a>{" "}
          or audit the{" "}
          <a
            className="text-mint"
            href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py"
            target="_blank"
            rel="noreferrer"
          >
            source code
          </a>
          .
        </p>
        <p className="text-xs uppercase tracking-[0.35em] text-slate">
          Note: appearing in the medal table means a country earned at least one simulated bronze (even if it reads 0.0%).
        </p>
      </section>
    </main>
  );
};

export default Sims;
