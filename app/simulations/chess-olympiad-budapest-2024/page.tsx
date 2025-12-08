import OlympiadSims from "@/components/OlympiadSims";
import TournamentInfo from "@/components/TournamentInfo";
import Link from "next/link";

const OlympiadSimsPage = () => {
  return (
    <div className="relative pt-32 pb-20">
      {/* Hero Section */}
      <section className="mb-12">
        <Link 
          href="/simulations"
          className="
            inline-flex items-center gap-2 
            text-sm text-text-secondary
            mb-6
            transition-colors duration-300
            hover:text-accent
          "
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Simulations</span>
        </Link>

        {/* Winner Banner */}
        <div className="
          glass-card p-6 mb-6
          border-accent/30
          bg-accent/5
        ">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🏆</span>
            <h2 className="font-display text-heading-lg text-accent">
              Tournament Complete
            </h2>
          </div>
          <p className="text-text-secondary">
            Congratulations to <span className="text-text-primary font-semibold">India</span> for 
            winning Gold in both the Open and Women&apos;s events!
          </p>
        </div>
        
        <TournamentInfo
          name="Chess Olympiad Budapest 2024"
          website="https://chessolympiad2024.fide.com/"
          description="Countries battle it out 4v4 to find the best chess nation."
          format="11 rounds of 4v4 team battles"
          status="completed"
        />
      </section>

      {/* Simulations */}
      <section className="mb-12">
        <OlympiadSims />
      </section>

      {/* Explanation Section */}
      <section className="glass-card p-8">
        <h2 className="font-display text-heading-xl text-text-primary mb-6">
          How These Simulations Work
        </h2>
        
        <div className="space-y-6 text-text-secondary leading-relaxed">
          <p>
            Before the Olympiad kicked off, I ran 5,000 simulations of the tournament to come up 
            with a prediction for the probabilities that each country wins (or gets silver/bronze). 
            Then, after each round, I run new simulations based on the current results. My simulations 
            also take into account the official FIDE pairing logic.
          </p>
          
          <p>
            In case you are wondering, yes, it was a nightmare to program. And it&apos;s not quite perfect. 
            For example, I&apos;m tracking how many whites each country has played. So when two teams face off, 
            whoever has had white on board one more times will get the black pieces on board one. But when they have played white 
            the same amount of times, then the white pieces should go to whoever had white less recently. 
            Right now, I just randomize who gets white - it&apos;s a small detail, not materially impacting 
            these predictions. But it&apos;s a good example of the complexities of the Olympiad pairing algorithm.
          </p>
          
          <p>
            That was a little bit of an introduction to the simulations for this particular event, and 
            you can read{' '}
            <Link 
              href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-light transition-colors"
            >
              more technical details here
            </Link>{' '}
            about the underlying model, method, and simulations. 
            You can also find the code{' '}
            <Link 
              href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-light transition-colors"
            >
              on GitHub
            </Link>.
          </p>
          
          <div className="
            p-4 
            rounded-lg 
            bg-bg-elevated/50 
            border border-border-subtle
          ">
            <p className="text-sm">
              <strong className="text-text-primary">Note:</strong> If a country is on the list above, 
              it means they at least won Bronze one time in one simulation, even if it says 0.0. 
              Countries that never win a medal in current simulations will not be in the table above.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OlympiadSimsPage;
