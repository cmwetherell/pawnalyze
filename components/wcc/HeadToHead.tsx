import Link from 'next/link';

import { playerHref } from '@/lib/olympiad/config';
import { getOlympiadPlayerGames } from '@/lib/olympiad/queries';
import type { PlayerGame } from '@/lib/olympiad/types';
import { HEAD_TO_HEAD, OLYMPIAD_FORM_EVENT } from '@/lib/wcc/config';
import type { PlayerId } from '@/lib/wcc/types';
import { Section, type Players } from './ui';

function H2HBar({ w1, d, w2, players }: { w1: number; d: number; w2: number; players: Players }) {
  const n = w1 + d + w2;
  const cells: { k: string; bg: string; label: string }[] = [
    ...Array.from({ length: w1 }, (_, i) => ({ k: `a${i}`, bg: 'var(--wcc-p1)', label: players[1].shortName[0] })),
    ...Array.from({ length: d }, (_, i) => ({ k: `d${i}`, bg: 'var(--wcc-draw)', label: '½' })),
    ...Array.from({ length: w2 }, (_, i) => ({ k: `b${i}`, bg: 'var(--wcc-p2)', label: players[2].shortName[0] })),
  ];
  return (
    <div className="flex gap-1" aria-hidden>
      {cells.map(c => (
        <span key={c.k} className="h-7 grid place-items-center rounded-md text-[11px] font-bold text-white" style={{ background: c.bg, width: `${100 / Math.max(n, 3)}%`, maxWidth: 44, minWidth: 28 }}>
          {c.label}
        </span>
      ))}
    </div>
  );
}

const PIP: Record<string, { bg: string; t: string; word: string }> = {
  '1': { bg: 'bg-emerald-500', t: 'W', word: 'win' },
  '0.5': { bg: 'bg-[var(--wcc-draw)]', t: 'D', word: 'draw' },
  '0': { bg: 'bg-rose-500', t: 'L', word: 'loss' },
};

function FormRow({ games, name, fideId, color }: { games: PlayerGame[]; name: string; fideId: number; color: string }) {
  const played = games.filter(g => g.score !== null);
  const score = played.reduce((a, g) => a + (g.score ?? 0), 0);
  const avgOpp = played.length ? Math.round(played.reduce((a, g) => a + g.oppRating, 0) / played.length) : null;
  return (
    <div className="rounded-xl bg-[var(--bg-surface-2)] p-3 sm:p-4">
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
          <span aria-hidden className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} /> {name}
        </p>
        <p className="text-xs tabular-nums text-[var(--text-secondary)]">
          <strong className="text-[var(--text-primary)]">{String(score).replace('.5', '½')}/{played.length}</strong>
          {avgOpp && <span className="text-[var(--text-muted)]"> · opp. avg {avgOpp}</span>}
        </p>
      </div>
      {played.length > 0 ? (
        <ol className="flex flex-wrap gap-1" aria-label={`${name}'s Olympiad games`}>
          {played.map(g => {
            const pip = PIP[String(g.score)];
            return (
              <li key={g.round} title={`R${g.round} vs ${g.oppName} (${g.oppRating}) with ${g.colour === 'w' ? 'White' : 'Black'}: ${pip.word}`}>
                <span className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white ${pip.bg}`}>
                  <span aria-hidden>{pip.t}</span>
                  <span className="sr-only">Round {g.round} against {g.oppName}: {pip.word}</span>
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-xs text-[var(--text-muted)]">No Olympiad games found.</p>
      )}
      <Link href={playerHref(OLYMPIAD_FORM_EVENT, fideId)} className="mt-2 inline-flex h-8 items-center text-xs text-gold-ink hover:underline">
        Olympiad games &amp; moves →
      </Link>
    </div>
  );
}

export default async function HeadToHead({ players }: { players: Players }) {
  const ids: PlayerId[] = [1, 2];
  const games = await Promise.all(ids.map(id => getOlympiadPlayerGames(OLYMPIAD_FORM_EVENT, players[id].fideId).catch(() => [] as PlayerGame[])));
  return (
    <Section
      id="head-to-head"
      eyebrow="Form guide"
      title="Head to head"
      description="Their previous meetings by time control, and how each played at the Samarkand Olympiad in September."
    >
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {HEAD_TO_HEAD.map(r => (
            <div key={r.tc}>
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <p className="text-sm font-semibold text-[var(--text-primary)]">{r.tc}</p>
                <p className="text-xs tabular-nums text-[var(--text-secondary)]">
                  {players[1].shortName} {r.wins1} · draws {r.draws} · {players[2].shortName} {r.wins2}
                </p>
              </div>
              <H2HBar w1={r.wins1} d={r.draws} w2={r.wins2} players={players} />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">{r.note}</p>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-muted)]">Chess Olympiad 2026 (Open)</p>
          <FormRow games={games[0]} name={players[1].shortName} fideId={players[1].fideId} color="var(--wcc-p1)" />
          <FormRow games={games[1]} name={players[2].shortName} fideId={players[2].fideId} color="var(--wcc-p2)" />
        </div>
      </div>
    </Section>
  );
}
