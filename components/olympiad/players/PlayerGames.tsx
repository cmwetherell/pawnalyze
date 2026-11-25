'use client';

import { GameViewer } from '@/components/chess/GameViewer';
import { PieceDot } from '@/components/chess/PieceDot';
import { resultOf } from '@/components/olympiad/boards/FormPips';
import { Flag } from '@/components/ui/Flag';
import { Pips } from '@/components/ui/Pips';
import { Row, Rows } from '@/components/ui/Rows';
import { TextLink } from '@/components/ui/TextLink';
import { setHash, useHash } from '@/hooks/useUrlParam';
import { eventHref, playerHref } from '@/lib/olympiad/config';
import { displayName } from '@/lib/olympiad/tpr';
import type { FormEntry, OlympiadEvent, PlayerGame, PlayerRaceRow } from '@/lib/olympiad/types';

interface PlayerGamesProps {
  event: OlympiadEvent;
  player: PlayerRaceRow;
  games: PlayerGame[];
  /** Rounds to show (1..lastRound); rounds without a game are "rested" */
  lastRound: number;
  /** Lets an opponent link to their own profile when they are in the race */
  knownFideIds: number[];
}

export function PlayerGames({ event, player, games, lastRound, knownFideIds }: PlayerGamesProps) {
  // The open replay lives in the hash (#r5) so a specific game can be shared.
  const hash = useHash();
  const open = /^r\d+$/.test(hash) ? Number(hash.slice(1)) : null;
  const setOpen = (r: number | null) => setHash(r === null ? '' : `r${r}`);
  const known = new Set(knownFideIds);
  const byRound = new Map<number, { form: FormEntry; game: PlayerGame | undefined }>();
  for (const f of player.form) byRound.set(f.round, { form: f, game: games.find(g => g.round === f.round) });
  const rounds = Array.from({ length: Math.max(lastRound, player.form.length ? Math.max(...player.form.map(f => f.round)) : 0) }, (_, i) => i + 1);

  return (
    <Rows label="Games by round">
      {rounds.map(r => {
        const entry = byRound.get(r);
        if (!entry) return <Row key={r} id={`r${r}`} size="sm" lead={<><Round n={r} /><span aria-hidden className="w-6" /></>} title={<span className="font-normal text-ink-3">Rested</span>} />;
        const { form, game } = entry;
        const result = resultOf(form.score);
        const opponent = displayName(form.oppName);
        const colour = form.colour === 'w' ? 'white' : 'black';
        const isOpen = open === r;
        const href = form.oppFideId !== null && known.has(form.oppFideId) ? playerHref(event, form.oppFideId) : null;
        return (
          <Row
            key={r}
            id={`r${r}`}
            size="sm"
            expanded={isOpen}
            toggle={{
              text: game?.moves ? (isOpen ? 'Hide' : 'Replay') : 'No moves',
              label: game?.moves ? `${isOpen ? 'Hide' : 'Replay'} round ${r} against ${opponent}` : `Round ${r}: no moves`,
              onToggle: () => setOpen(isOpen ? null : r),
              disabled: !game?.moves,
            }}
            lead={<><Round n={r} />{form.oppFedCode && <Flag code={form.oppFedCode} size="sm" decorative />}</>}
            title={href ? <TextLink quiet href={href}>{opponent}</TextLink> : opponent}
            meta={
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="inline-flex items-center gap-1.5"><PieceDot side={colour} />{colour === 'white' ? 'White' : 'Black'}</span>
                <span className="tnum">{form.oppRating || 'unrated'}</span>
                {form.oppTeamId !== null && form.oppFedCode && <TextLink quiet href={`${eventHref(event)}?team=${form.oppTeamId}`}>{form.oppFedCode}</TextLink>}
              </span>
            }
            value={
              <span className="flex items-center gap-2">
                <span className="hidden font-normal text-ink-2 sm:inline">{result.word}</span>
                <Pips kind="result" items={[{ label: result.word, letter: result.letter, tone: result.tone }]} />
              </span>
            }
          >
            {isOpen && game && (
              <div className="pb-6 pt-2">
                <GameViewer
                  moves={game.moves}
                  white={{ name: form.colour === 'w' ? displayName(player.name) : opponent, rating: form.colour === 'w' ? player.rating : form.oppRating }}
                  black={{ name: form.colour === 'b' ? displayName(player.name) : opponent, rating: form.colour === 'b' ? player.rating : form.oppRating }}
                  result={game.result}
                  orientation={form.colour}
                />
              </div>
            )}
          </Row>
        );
      })}
    </Rows>
  );
}

const Round = ({ n }: { n: number }) => <span className="w-10 type-data text-ink-3">R{n}</span>;
