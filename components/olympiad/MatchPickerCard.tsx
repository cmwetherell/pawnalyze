'use client';

import Flag from '@/components/ui/Flag';
import { formatMatchScore } from '@/lib/olympiad/standings';
import type { DerivedStanding, Match, Outcome, Team } from '@/lib/olympiad/types';

/** Model probabilities from team1's perspective */
export interface WinProbs { w: number; d: number; l: number }

interface MatchPickerCardProps {
  match: Match;
  team1: Team;
  team2: Team | null;
  standing1?: DerivedStanding;
  standing2?: DerivedStanding;
  /** From team1's perspective: 'w' = team1 wins, 'l' = team2 wins */
  selected: Outcome | null;
  onChange: (outcome: Outcome | null) => void;
  /** Hide MP when nothing has been played yet */
  showMp: boolean;
  probs?: WinProbs | null;
  /** Result is known; no picking */
  locked?: boolean;
}

export function shortTeamName(name: string): string {
  return name
    .replace('United States of America', 'United States')
    .replace('Bosnia and Herzegovina', 'Bosnia & Herz.')
    .replace('Democratic Republic of the Congo', 'DR Congo')
    .replace('Saint Vincent and the Grenadines', 'St Vincent')
    .replace('Trinidad & Tobago', 'Trinidad')
    .replace('FIDE/UNHCR Refugee Team', 'Refugee Team');
}

type SideState = 'idle' | 'winner' | 'loser' | 'draw';

function TeamSide({ team, standing, showMp, align, isWhite, state, onClick, prob, locked }: {
  team: Team; standing?: DerivedStanding; showMp: boolean; align: 'left' | 'right'; isWhite: boolean;
  state: SideState; onClick: () => void; prob: number | null; locked: boolean;
}) {
  const right = align === 'right';
  const tone =
    state === 'winner' ? 'bg-emerald-500/15 ring-1 ring-emerald-500/50'
      : state === 'draw' ? 'bg-chess-gold/10 ring-1 ring-chess-gold/30'
        : state === 'loser' ? 'opacity-45'
          : locked ? '' : 'hover:bg-[var(--bg-surface-3)]';
  const content = (
    <>
      <span className="relative shrink-0">
        <Flag code={team.fedCode} size="md" title={team.name} />
        {state === 'winner' && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow" aria-hidden>
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className={`block text-sm font-medium truncate leading-tight text-[var(--text-primary)] ${state === 'loser' ? 'line-through decoration-[var(--text-muted)]' : ''}`}>
          {shortTeamName(team.name)}
        </span>
        <span className={`text-[11px] text-[var(--text-muted)] tabular-nums flex items-center gap-1 overflow-hidden whitespace-nowrap ${right ? 'justify-end' : ''}`}>
          {isWhite && (
            <span className="inline-block w-2 h-2 rounded-[2px] bg-gray-200 border border-gray-400" title="White on board 1" />
          )}
          <span title={`Seed #${team.teamId}`}>#{team.teamId}</span>
          <span>·</span>
          <span>{team.avgRating}</span>
          {showMp && standing && (
            <>
              <span>·</span>
              <span className="font-semibold text-[var(--text-secondary)]">{standing.mp} MP</span>
            </>
          )}
        </span>
        {prob !== null && (
          <span className={`block text-[11px] tabular-nums font-semibold ${prob >= 0.5 ? 'text-emerald-500' : 'text-[var(--text-secondary)]'}`}>
            {Math.round(prob * 100)}% to win
          </span>
        )}
      </span>
    </>
  );
  const cls = `flex items-center gap-2 min-w-0 flex-1 rounded-md px-1.5 py-1.5 transition-all text-left ${right ? 'flex-row-reverse text-right' : ''} ${tone}`;
  if (locked) return <div className={cls}>{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={state === 'winner'}
      title={state === 'winner' ? `${team.name} wins — tap to clear` : `${team.name} wins`}
      className={cls}
    >
      {content}
    </button>
  );
}

export default function MatchPickerCard({
  match, team1, team2, standing1, standing2, selected, onChange, showMp, probs = null, locked = false,
}: MatchPickerCardProps) {
  const hasSelection = selected !== null;
  const isFinal = match.status === 'final';
  const isLive = match.status === 'live';

  if (!team2) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--bg-surface-2)]/40 text-xs text-[var(--text-muted)]">
        <Flag code={team1.fedCode} size="sm" />
        <span className="text-[var(--text-primary)] font-medium">{shortTeamName(team1.name)}</span>
        <span>receives a bye</span>
      </div>
    );
  }

  const side = (mine: Outcome): SideState =>
    selected === null ? 'idle' : selected === 'd' ? 'draw' : selected === mine ? 'winner' : 'loser';
  const toggle = (value: Outcome) => { if (!locked) onChange(selected === value ? null : value); };

  return (
    <div
      className={`rounded-lg transition-colors overflow-hidden ${
        hasSelection
          ? 'bg-[var(--bg-surface-2)] ring-1 ring-chess-gold/30'
          : locked ? 'bg-[var(--bg-surface-2)]/40' : 'bg-[var(--bg-surface-2)]/50 hover:bg-[var(--bg-surface-2)]'
      }`}
    >
      <div className="flex items-center gap-1 px-1.5 py-1.5">
        <TeamSide
          team={team1} standing={standing1} showMp={showMp} align="right" isWhite
          state={side('w')} onClick={() => toggle('w')} prob={probs ? probs.w : null} locked={locked}
        />
        {locked ? (
          <span className="shrink-0 w-12 text-center font-mono text-sm text-[var(--text-primary)]">{formatMatchScore(match.team1Score, match.team2Score)}</span>
        ) : (
          <button
            type="button"
            onClick={() => toggle('d')}
            aria-pressed={selected === 'd'}
            title={selected === 'd' ? 'Drawn match — tap to clear' : `Drawn match (2–2)${probs ? ` · ${Math.round(probs.d * 100)}%` : ''}`}
            className={`shrink-0 w-10 h-10 rounded-md text-sm font-bold transition-colors flex flex-col items-center justify-center leading-none ${
              selected === 'd'
                ? 'bg-chess-gold text-chess-dark'
                : 'bg-[var(--bg-surface-1)] border border-[var(--border)] text-[var(--text-muted)] hover:text-gold-ink hover:border-chess-gold/40'
            }`}
          >
            =
            {probs && <span className="text-[10px] font-medium mt-0.5">{Math.round(probs.d * 100)}%</span>}
          </button>
        )}
        <TeamSide
          team={team2} standing={standing2} showMp={showMp} align="left" isWhite={false}
          state={side('l')} onClick={() => toggle('l')} prob={probs ? probs.l : null} locked={locked}
        />
      </div>
      {probs && !locked && (
        <div className="mx-2 mb-1.5 h-1 rounded-full overflow-hidden flex bg-[var(--bg-surface-3)]" aria-hidden>
          <div className="h-full bg-emerald-500/80" style={{ width: `${probs.w * 100}%` }} />
          <div className="h-full bg-chess-gold/80" style={{ width: `${probs.d * 100}%` }} />
          <div className="h-full bg-rose-400/80" style={{ width: `${probs.l * 100}%` }} />
        </div>
      )}
      {match.projected && !isFinal && !isLive && (
        <div className="flex items-center justify-center gap-1 px-3 py-0.5 text-[10px] uppercase tracking-wider text-gold-ink/80 border-t border-[var(--border)]">
          Projected pairing
        </div>
      )}
      {(isFinal || isLive) && (
        <div className={`flex items-center justify-center gap-2 px-3 py-1 text-[11px] border-t border-[var(--border)] ${
          isLive ? 'text-red-400' : 'text-[var(--text-muted)]'
        }`}>
          {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-live" />}
          <span>{isLive ? 'In progress' : locked ? 'Final · not yet in the simulations' : 'Final'}</span>
          {!locked && <span className="font-mono text-[var(--text-secondary)]">{formatMatchScore(match.team1Score, match.team2Score)}</span>}
          <span className="hidden sm:inline">· Board {match.boardNo}</span>
        </div>
      )}
    </div>
  );
}
