import { Section } from '@/components/layout/Section';
import { Explainer } from '@/components/ui/Explainer';

const ITEMS = [
  { title: 'Board-by-board Monte Carlo', body: 'Every remaining match is played out on all four boards from the players’ ratings, colour and draw tendencies, then scored 2/1/0 in match points.' },
  { title: 'Swiss pairings, simulated', body: 'Each simulation re-pairs the field round after round by score group, so future opponents are uncertain, exactly as in the real event.' },
  { title: 'Scenario explorer', body: 'Picking a result keeps only the simulations where it happened. Pick a published pairing, or a team’s result in a round whose pairings aren’t out yet.' },
];

export function OlympiadMethod({ description, nonParticipants }: { description: string; nonParticipants: string[] }) {
  return (
    <Section id="method" title="How it works" finding={description}>
      <Explainer
        items={ITEMS}
        note={(
          <>
            <p>
              Standings shown during the event are computed from match results (match points, then game points) and may differ from the official tiebreaks.
              For the model details see{' '}
              <a href="https://github.com/cmwetherell/cmwetherell.github.io/blob/main/chessSim/simOlympiad.py" target="_blank" rel="noopener noreferrer">the simulation code</a> and{' '}
              <a href="https://blog.pawnalyze.com/chess-simulations/2022/06/20/How-Our-Chess-Tournament-Predictions-Work.html" target="_blank" rel="noopener noreferrer">How Our Chess Tournament Predictions Work</a>.
            </p>
            {nonParticipants.length > 0 && <p className="mt-3">Registered but not playing: {nonParticipants.join(', ')}.</p>}
          </>
        )}
      />
    </Section>
  );
}
