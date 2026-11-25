import { Section } from '@/components/layout/Section';
import { Explainer } from '@/components/ui/Explainer';
import { TextLink } from '@/components/ui/TextLink';
import { MIN_GAMES_FOR_PRIZE, UNRATED_OPP_RATING } from '@/lib/olympiad/tpr';

const ITEMS = [
  {
    title: 'Performance rating decides',
    body: 'Each board medal goes to the highest tournament performance rating (TPR): the average rating of a player’s opponents plus FIDE’s bonus for their percentage score. A 75% score is worth about +190 points; a perfect score +800.',
  },
  {
    title: `${MIN_GAMES_FOR_PRIZE} games to qualify`,
    body: `Only players with at least ${MIN_GAMES_FOR_PRIZE} of the 11 games are eligible, and ties are broken by the greater number of games. Captains who rest a star too often can talk them out of a medal.`,
  },
  {
    title: 'Early leaders come from small teams',
    body: 'Two wins against lower-rated opponents can top the table after round two. The pairings soon bring stronger opposition, and the eight-game rule sorts out who is really in the race.',
  },
];

export function BoardRaceExplainer() {
  return (
    <Section id="board-race-how" title="How board medals work">
      <Explainer
        columns={3}
        items={ITEMS}
        note={
          <>
            Players compete on the board they hold in their team list, with the reserve as a fifth category. Ratings and results come from the
            official broadcast; unrated opponents count as {UNRATED_OPP_RATING}, and unplayed games (forfeits) are excluded, following the FIDE
            rating regulations. Source:{' '}
            <TextLink href="https://handbook.fide.com/files/handbook/Olympiad2026MainCompetition.pdf">FIDE Chess Olympiad 2026 regulations</TextLink>, article 4.6.3.
          </>
        }
      />
    </Section>
  );
}
