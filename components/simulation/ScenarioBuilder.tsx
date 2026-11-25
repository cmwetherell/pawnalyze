'use client';

import { useState } from 'react';

import { ScenarioPanel } from '@/components/chess/ScenarioPanel';
import { Disclosure } from '@/components/ui/Disclosure';
import type { Game } from '@/types';
import { GameRow } from './GameRow';
import { isPlayed, type GameRound, type Outcome } from './rounds';

interface ScenarioBuilderProps {
  rounds: GameRound[];
  picks: Game[];
  onPick: (game: Game, outcome: Outcome | null) => void;
  onReset: () => void;
  onSimulate: () => void;
  loading: boolean;
  /** Over the buttons: how much is picked. */
  note?: string | null;
}

/** Results of the rounds played, picks for the rounds to come. */
export function ScenarioBuilder({ rounds, picks, onPick, onReset, onSimulate, loading, note }: ScenarioBuilderProps) {
  const played = rounds.filter(isPlayed);
  const open = rounds.filter(r => !isPlayed(r));
  const [chosen, setChosen] = useState<number | null>(null);
  const active = open.find(r => r.round === chosen) ?? open[0];
  const over = open.length === 0;

  return (
    <ScenarioPanel
      title={over ? 'Results' : 'Scenario Builder'}
      collapsible
      scroll={over ? 'none' : 'lg'}
      summary={over ? 'Every game of the tournament, round by round.' : 'Select game outcomes to simulate custom scenarios'}
      rounds={open.map(r => ({ key: String(r.round), label: `R${r.round}`, dot: picks.some(g => g.round === r.round) ? 'pick' : null }))}
      round={active ? String(active.round) : ''}
      onRound={key => setChosen(Number(key))}
      note={note && <span role="status">{note}</span>}
      primary={over ? undefined : { label: loading ? 'Simulating' : 'Simulate', onClick: onSimulate, loading }}
      onReset={picks.length > 0 && !loading ? onReset : undefined}
    >
      {active?.games.map(game => (
        <GameRow key={game.id} game={game} pick={(picks.find(g => g.id === game.id)?.outcome ?? null) as Outcome | null} onPick={o => onPick({ ...game, round: active.round }, o)} disabled={loading} />
      ))}
      {played.map(r => (
        <Disclosure key={r.round} variant="row" summary={`Round ${r.round}`} meta="Completed">
          {r.games.map(game => <GameRow key={game.id} game={game} />)}
        </Disclosure>
      ))}
    </ScenarioPanel>
  );
}
