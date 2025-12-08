import Image from "next/image";

const About = () => {
  return (
    <main className="page-shell space-y-12">
      <section className="hero-grid gap-10">
        <div className="space-y-4">
          <span className="tag-pill">Founder — Caleb Wetherell</span>
          <h1 className="text-balance font-display text-4xl uppercase tracking-[0.35em] text-paper">
            Building a chess lab for the relentlessly curious.
          </h1>
          <p className="text-lg text-slate">
            I&apos;m a Seattle-based data scientist with a habit of turning side quests into full-stack experiments.
            Pawnalyze started as notebook scribbles about tournament volatility and grew into a live simulation studio for
            chess obsessives.
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://www.twitter.com/pawnalyze"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.35em] text-paper"
            >
              Follow on X
            </a>
            <a
              href="https://www.github.com/cmwetherell/pawnalyze"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.35em] text-paper"
            >
              Explore GitHub
            </a>
          </div>
        </div>
        <div className="hero-aurora glass-panel flex items-center justify-center p-6">
          <Image
            src="/img/selfie.jpeg"
            alt="Caleb Wetherell"
            width={320}
            height={320}
            className="rounded-3xl border border-white/30 object-cover"
          />
        </div>
      </section>

      <section className="glass-panel space-y-6 p-6">
        <h2 className="font-display text-3xl uppercase tracking-[0.35em] text-paper">What drives pawnalyze</h2>
        <p className="text-slate">
          Pawnalyze mixes simulation engineering with editorial storytelling. Nightly Monte Carlo runs cover the world
          championship cycle, candidates, Olympiad, and whatever chaotic invitational happens to break chess Twitter. The
          goal is simple: hand journalists, players, and fans a control room where every scenario feels tangible.
        </p>
        <p className="text-slate">
          Every chart across the site is backed by public code. You can audit the assumptions, fork the tools, or embed
          the widgets right inside your broadcast. Transparency breeds trust—especially when probabilities enter the chat.
        </p>
      </section>

      <section className="split-panel">
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mint/80">Elocator</p>
          <h3 className="mt-2 text-2xl text-paper">Complexity, quantified for humans</h3>
          <p className="mt-3 text-slate">
            Elocator predicts how punishing a chess position feels by watching grandmasters bleed win percentage. A neural
            net trained on 100k+ FENs estimates the swing you should expect after each move—a north star for commentators
            and study addicts trying to define “difficult”.
          </p>
        </div>
        <div className="glass-panel p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-mint/80">Recognition</p>
          <h3 className="mt-2 text-2xl text-paper">Stories with real-world impact</h3>
          <p className="mt-3 text-slate">
            Pawnalyze analysis has been cited by The New York Times, NPR, and the chess press when integrity questions
            erupted. The mission: amplify data-backed narratives that help fans make sense of scandal, form, and surprise.
          </p>
        </div>
      </section>

      <section className="glass-panel space-y-4 p-6">
        <h3 className="text-lg uppercase tracking-[0.35em] text-paper">Join the signal</h3>
        <p className="text-slate">
          If you love mixing spreadsheets with Sicilians, stay close. Add Pawnalyze to your prep toolkit, embed the medal
          race, or simply lurk until the next chaos event. I&apos;ll be here rerunning the tree.
        </p>
      </section>
    </main>
  );
};

export default About;