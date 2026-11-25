import { Part } from '@/components/layout/Part';
import { Heading } from '@/components/ui/Heading';
import { Pips, type PipItem } from '@/components/ui/Pips';
import { Row, Rows } from '@/components/ui/Rows';
import { Swatch } from '@/components/ui/Swatch';
import { TextLink } from '@/components/ui/TextLink';
import type { Tone } from '@/lib/theme/tones';
import { playerHref } from '@/lib/olympiad/config';
import { getOlympiadPlayerGames } from '@/lib/olympiad/queries';
import type { PlayerGame } from '@/lib/olympiad/types';
import { HEAD_TO_HEAD, OLYMPIAD_FORM_EVENT, type H2HRecord } from '@/lib/wcc/config';
import type { DisplayPlayer, Players } from '@/lib/wcc/display';
import type { PlayerId } from '@/lib/wcc/types';

function meetings(r: H2HRecord, players: Players): PipItem[] {
  const [a, b] = [players[1].shortName, players[2].shortName];
  return [
    ...Array.from({ length: r.wins1 }, () => ({ label: `${a} won`, letter: a[0], tone: 'p1' as const })),
    ...Array.from({ length: r.draws }, () => ({ label: 'Draw', letter: '½', tone: 'draw' as const })),
    ...Array.from({ length: r.wins2 }, () => ({ label: `${b} won`, letter: b[0], tone: 'p2' as const })),
  ];
}

const RESULT: Record<string, { tone: Tone; letter: string; word: string }> = {
  '1': { tone: 'win', letter: 'W', word: 'win' },
  '0.5': { tone: 'draw', letter: 'D', word: 'draw' },
  '0': { tone: 'loss', letter: 'L', word: 'loss' },
};

function FormRow({ games, player }: { games: PlayerGame[]; player: DisplayPlayer }) {
  const played = games.filter(g => g.score !== null);
  const score = played.reduce((a, g) => a + (g.score ?? 0), 0);
  const avgOpp = played.length ? Math.round(played.reduce((a, g) => a + g.oppRating, 0) / played.length) : null;
  return (
    <Row
      size="sm"
      title={<span className="inline-flex items-center gap-2"><Swatch tone={player.id === 1 ? 'p1' : 'p2'} />{player.shortName}</span>}
      value={played.length > 0 && `${String(score).replace('.5', '½')}/${played.length}`}
      meta={avgOpp ? `Average opponent ${avgOpp}` : 'No Olympiad games found.'}
    >
      {/* The same shape for both, whatever the number of games: on one line only where ten or more fit beside the link. */}
      <div className="flex flex-col items-start justify-between gap-x-4 pb-1 md:-mt-2 md:flex-row md:items-center lg:mt-0 lg:flex-col lg:items-start xl:-mt-2 xl:flex-row xl:items-center">
        {played.length > 0 && (
          <Pips
            kind="form"
            ariaLabel={`${player.shortName}'s Olympiad games`}
            items={played.map(g => {
              const r = RESULT[String(g.score)];
              return { label: `Round ${g.round} against ${g.oppName} (${g.oppRating}) with ${g.color === 'w' ? 'White' : 'Black'}: ${r.word}`, letter: r.letter, tone: r.tone };
            })}
          />
        )}
        <TextLink standalone href={playerHref(OLYMPIAD_FORM_EVENT, player.fideId)} aria-label={`${player.shortName}: Olympiad games and moves`}>Olympiad games and moves</TextLink>
      </div>
    </Row>
  );
}

export default async function HeadToHead({ players }: { players: Players }) {
  const ids: PlayerId[] = [1, 2];
  const defender = players[players[2].isChampion ? 2 : 1];
  const challenger = players[defender.id === 1 ? 2 : 1];
  const games = await Promise.all(ids.map(id => getOlympiadPlayerGames(OLYMPIAD_FORM_EVENT, players[id].fideId).catch(() => [] as PlayerGame[])));
  return (
    <Part
      id="head-to-head"
      title="Head to head"
      finding={`${defender.name} (${defender.country}) defends against Candidates winner ${challenger.name} (${challenger.country}). Their previous meetings by time control, and how each played at the Samarkand Olympiad in September.`}
    >
      <Rows label="Previous meetings by time control">
        {HEAD_TO_HEAD.map(r => (
          <Row
            key={r.tc}
            size="sm"
            title={<>{r.tc}<span className="font-normal text-ink-2">: {players[1].shortName} {r.wins1}, draws {r.draws}, {players[2].shortName} {r.wins2}</span></>}
            meta={r.note}
            value={<Pips kind="result" items={meetings(r, players)} ariaLabel={`${r.tc} games`} />}
          />
        ))}
      </Rows>
      <Heading level={3} style="h3" className="mb-3 mt-8">Chess Olympiad 2026 (Open)</Heading>
      <Rows label="Chess Olympiad 2026 form">
        {ids.map((id, i) => <FormRow key={id} games={games[i]} player={players[id]} />)}
      </Rows>
    </Part>
  );
}
