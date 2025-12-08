import Image from "next/image";
import ChessButton from "@/components/Button";

const highlights = [
  {
    title: "Media Signals",
    detail: "Hans Niemann investigation cited by The New York Times and NPR for data rigor",
  },
  {
    title: "Open Source DNA",
    detail: "Core simulators + Elocator models are transparent and community-reviewable",
  },
  {
    title: "Seattle Crafted",
    detail: "Built nights and weekends inside a small Capitol Hill studio",
  },
];

const milestones = [
  {
    year: "2021",
    text: "Pawnalyze begins as a personal notebook to track classical prep for friends on the circuit.",
  },
  {
    year: "2022",
    text: "Monte Carlo engine ships with tournament visualizations and a pipeline into the public blog.",
  },
  {
    year: "2023",
    text: "Elocator launches with a neural net trained on 100K GM moves to estimate position complexity.",
  },
  {
    year: "2024",
    text: "Broadcast tools, medal radars, and APIs turn Pawnalyze into a proper chess intelligence lab.",
  },
];

export default function About() {
  return (
    <main className="container space-y-16 py-16">
      <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">About Pawnalyze</p>
          <h1 className="font-display text-5xl text-sand">A lone-data-scientist skunkworks dedicated to chess clarity</h1>
          <p className="text-lg text-sand-muted">
            I&apos;m Caleb Wetherell, a Seattle-based data scientist and serial hobbyist. Pawnalyze is my perpetual lab
            project where simulations, storytelling, and neural heuristics collide so the chess world can reason faster.
          </p>
          <div className="flex flex-wrap gap-4">
            <ChessButton text="Say hello on X" link="https://www.twitter.com/pawnalyze" variant="secondary" />
            <ChessButton text="Source on GitHub" link="https://github.com/cmwetherell" variant="ghost" />
          </div>
        </div>
        <div className="rounded-4xl border border-white/10 bg-black/30 p-6">
          <Image
            src="/img/selfie.jpeg"
            alt="Caleb Wetherell"
            width={480}
            height={480}
            className="mx-auto rounded-3xl border border-white/20 object-cover"
            priority
          />
          <p className="mt-4 text-center text-sm text-sand-muted">Building, modeling, and occasionally blundering pieces in Seattle.</p>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div key={item.title} className="rounded-3xl border border-white/10 bg-gradient-to-br from-black/30 to-black/10 p-6">
            <p className="text-xs uppercase tracking-[0.4em] text-amber">{item.title}</p>
            <p className="mt-3 text-sm text-sand-muted">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="rounded-4xl border border-white/10 bg-black/30 p-8 shadow-subtle">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.5em] text-sand-muted">Elocator</p>
            <h2 className="font-display text-3xl text-sand">Decoding human complexity</h2>
            <p className="mt-4 text-base text-sand-muted">
              Elocator predicts how much a human is likely to lose from an engine-best line after any given move. It&apos;s
              equal parts cheating deterrent, prep assistant, and storytelling device for commentators.
            </p>
            <p className="mt-4 text-base text-sand-muted">
              The neural net looks at material makeup, king safety, imbalance patterns, and tempo swings. Each factor is
              translated into expectations on how precise humans really are when the board explodes.
            </p>
            <a
              href="https://github.com/cmwetherell/elocator"
              className="mt-4 inline-flex text-mint"
              target="_blank"
              rel="noreferrer"
            >
              Read the research notes {'->'}
            </a>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="space-y-6">
              {milestones.map((milestone) => (
                <div key={milestone.year} className="flex gap-4">
                  <div className="font-display text-2xl text-amber">{milestone.year}</div>
                  <p className="text-sm text-sand-muted">{milestone.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
