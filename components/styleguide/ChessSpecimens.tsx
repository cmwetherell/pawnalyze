'use client';

import { useState } from 'react';

import { Board } from '@/components/chess/Board';
import { BoardControls } from '@/components/chess/BoardControls';
import { BoardPane } from '@/components/chess/BoardPane';
import { ComplexityChart } from '@/components/chess/ComplexityChart';
import { ComplexityScale } from '@/components/chess/ComplexityScale';
import { FaceOff } from '@/components/chess/FaceOff';
import { GameSheet } from '@/components/chess/GameSheet';
import { GameViewer } from '@/components/chess/GameViewer';
import { MatchCalendar } from '@/components/chess/MatchCalendar';
import { MatchRow } from '@/components/chess/MatchRow';
import { MoveList } from '@/components/chess/MoveList';
import { OddsChip } from '@/components/chess/OddsChip';
import { PieceDot } from '@/components/chess/PieceDot';
import { PlayerClock } from '@/components/chess/PlayerClock';
import { Replay } from '@/components/chess/Replay';
import { ScenarioPanel } from '@/components/chess/ScenarioPanel';
import { Section } from '@/components/layout/Section';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Flag } from '@/components/ui/Flag';
import { PhotoCreditLine } from '@/components/ui/PhotoCredit';
import { Rows } from '@/components/ui/Rows';
import { SearchInput } from '@/components/ui/Input';
import goc from '@/lib/elocator/game-of-the-century.json';
import { SCHEDULE_DAYS } from '@/lib/wcc/config';
import { WCC_PHOTOS } from '@/lib/wcc/photos';
import { GAMES, gameCells, ODDS, P1, PLAYERS, SIDES } from './fixtures';
import { Specimen, Variant, Variants } from './Specimen';

const MOVES = goc as { ply: number; san?: string; from?: string; to?: string; fen: string; c: number }[];
const LAST = MOVES.length - 1;
const PGN = MOVES.slice(1).map(m => (m.ply % 2 === 1 ? `${(m.ply + 1) / 2}. ${m.san}` : m.san)).join(' ');
const WDL = [{ key: 'w', value: 0.46, tone: 'win' as const, label: 'Uzbekistan' }, { key: 'd', value: 0.34, tone: 'draw' as const, label: 'Draw' }, { key: 'l', value: 0.2, tone: 'loss' as const, label: 'India' }];
const PICKS = [
  { value: '1', label: 'White wins', glyph: '1', tone: 'ink' as const }, { value: 'd', label: 'Draw', glyph: '=', tone: 'draw' as const }, { value: '2', label: 'Black wins', glyph: '0', tone: 'ink' as const },
];

const CREDIT = <PhotoCreditLine photos={[WCC_PHOTOS.gukesh.portrait, WCC_PHOTOS.sindarov.portrait]} changes="Backgrounds removed, black and white" />;

/** The page's own hero: the face-off the rest of the page answers to. */
export function HeroSpecimen() {
  return (
    <FaceOff
      variant="hero" sides={SIDES} p1={P1} score="½–½" scoreLabel="after game 1"
      verdict={<>Sindarov wins about 85 in 100 matches. 13.6% go to tiebreaks. <span className="block text-ink-3">Kalshi traders gave Gukesh 27.9% after game 1.</span></>}
      notes={['Chance to win the match. Each pawn is 1 in 100.', 'Exact odds, confirmed by 10,000 simulations.']}
      next="Game 2, Wed, Nov 25 at 3:00 PM CET"
      actions={<><Button variant="primary" href="/world-chess-championship-2026/live">Watch live</Button><Button href="#forms">Pick results</Button></>}
      credit={CREDIT}
    />
  );
}

export function ChessSpecimens() {
  const [ply, setPly] = useState(33);
  const [flipped, setFlipped] = useState(false);
  const [picks, setPicks] = useState<Record<number, '1' | 'd' | '2'>>({ 3: '1', 4: 'd' });
  const [preview, setPreview] = useState<number | null>(null);
  const [round, setRound] = useState('10');
  const [board, setBoard] = useState<string | null>('1');
  const at = MOVES[ply];
  return (
    <>
      <Section id="match" title="Face-off, smaller" layout="plain" finding="The feature variant, on home and the index. Below it, a scenario that moves the odds, and a finished match.">
        <Specimen name="FaceOff feature" from="chess/FaceOff">
          <FaceOff variant="feature" sides={SIDES} p1={P1} score="½–½" scoreLabel="after game 1" heading={<Heading level={3} style="h3">World Chess Championship 2026, Geneva</Heading>} next="Game 2, Wed, Nov 25 at 3:00 PM CET" notes={['Chance to win the match. Each pawn is 1 in 100.', 'Exact odds, confirmed by 10,000 simulations.']} actions={<><Button variant="primary" href="/world-chess-championship-2026">See the match odds</Button><Button href="/world-chess-championship-2026/live">Watch live</Button></>} credit={CREDIT} />
        </Specimen>
        <Specimen name="FaceOff, scenario" from="chess/FaceOff" note="A delta over each figure, in room the hero keeps for it."><FaceOff variant="feature" sides={SIDES} p1={0.343} base={P1} score="½–½" scoreLabel="after game 1" /></Specimen>
        <Specimen name="FaceOff, before odds" from="chess/FaceOff"><FaceOff variant="feature" sides={SIDES} p1={null} score="–" scoreLabel="before game 1" /></Specimen>
        <Specimen name="OddsChip" from="chess/OddsChip">
          <div className="grid gap-6 sm:grid-cols-2">
            <Variant label="inline, section bar"><OddsChip sides={ODDS} /></Variant>
            <Variant label="inline, preview"><OddsChip preview={0.343} sides={ODDS} /></Variant>
            <Variant label="halves, bottom bar"><span className="flex"><OddsChip variant="halves" sides={ODDS} /></span></Variant>
            <Variant label="halves, preview"><span className="flex"><OddsChip variant="halves" preview={0.343} sides={ODDS} /></span></Variant>
          </div>
        </Specimen>
      </Section>

      <Section id="sheet" title="Scoresheet" layout="wide" finding="The fourteen games. Every game number opens the live page." actions={<Button size="sm" icon="reset" onClick={() => setPicks({})}>Reset</Button>}>
        <Specimen name="GameSheet" from="chess/GameSheet" note="Pointing at a pick, or moving to it with the keyboard, shows the odds it would give. Press it and the preview ends.">
          <div data-preview="" className="mb-6 type-ui"><OddsChip sides={ODDS} preview={preview} /></div>
          <GameSheet games={gameCells(picks)} players={PLAYERS} locked={false} onPreview={setPreview} onPick={(g, v) => setPicks(p => { const n = { ...p }; if (v) n[g] = v; else delete n[g]; return n; })} />
        </Specimen>
        <Specimen name="MatchCalendar" from="chess/MatchCalendar"><MatchCalendar days={SCHEDULE_DAYS} games={GAMES} players={PLAYERS} hrefFor={g => `/world-chess-championship-2026/live?game=${g}`} /></Specimen>
        <Specimen name="PieceDot" from="chess/PieceDot" note="Always beside the words."><Variants className="type-small text-ink-2"><span className="inline-flex items-center gap-2"><PieceDot side="white" />White: Gukesh</span><span className="inline-flex items-center gap-2"><PieceDot side="black" />Black: Sindarov</span></Variants></Specimen>
      </Section>

      <Section id="board" title="Board" layout="rail" finding="One board, one set of controls, one move list. Arrow keys step through the moves.">
        <Specimen name="Replay, BoardPane, EvalBar, PlayerClock, BoardControls, MoveList" from="chess/" note="From 1024 the controls stand under the aside and the board takes their height. Moves and complexity scores are real; the clocks and the evaluation are samples.">
          <Replay
            size="lg" label="Game; use the arrow keys to step through the moves" ply={ply} last={LAST} onGo={setPly} onFlip={() => setFlipped(f => !f)}
            head={<Heading level={4} style="h3">Byrne – Fischer</Heading>}
            board={(
              <BoardPane
                fen={at.fen} from={at.from} to={at.to} flipped={flipped} label={`Position after ply ${ply}`} evaluation={{ cp: -120, depth: 30, source: 'cloud' }}
                top={<PlayerClock name={flipped ? 'Byrne' : 'Fischer'} tone={flipped ? 'p1' : 'p2'} clock="0:41:07" running={ply % 2 === 1} />}
                bottom={<PlayerClock name={flipped ? 'Fischer' : 'Byrne'} tone={flipped ? 'p2' : 'p1'} clock="0:38:22" running={ply % 2 === 0} />}
              />
            )}
            controls={<BoardControls ply={ply} last={LAST} onGo={setPly} onFlip={() => setFlipped(f => !f)} live={{ behind: ply < LAST, onLive: () => setPly(LAST) }} />}
            aside={<MoveList moves={MOVES.slice(1).map(m => ({ san: m.san ?? '', meta: String(m.c) }))} ply={ply} onGo={setPly} maxHeight={220} fill />}
          />
        </Specimen>
        <Specimen name="ComplexityChart" from="chess/ComplexityChart">
          <ComplexityChart
            points={MOVES.map(m => ({ ply: m.ply, san: m.san ?? null, toMove: m.ply % 2 ? 'b' : 'w', complexity: m.c }))}
            sides={{ w: { name: 'Byrne', tone: 'ink' }, b: { name: 'Fischer', tone: 'context' } }} selected={ply} onSelect={setPly}
            table={{ columns: ['Ply', 'Complexity'], rows: MOVES.map(m => [m.ply, m.c]) }}
          />
        </Specimen>
        <Specimen name="ComplexityScale" from="chess/ComplexityScale">
          <div className="grid gap-6">{[12, 40, 62, at.c].map((s, i) => <ComplexityScale key={i} score={s} size={i === 3 ? 'lg' : 'sm'} />)}<ComplexityScale score={at.c} size="lg" words={false} /><ComplexityScale score={null} /></div>
        </Specimen>
        <Specimen name="Board sizes" from="chess/Board"><Variants><div className="w-24"><Board fen={MOVES[0].fen} label="Start" coords={false} /></div><div className="w-48"><Board fen={MOVES[33].fen} from={MOVES[33].from} to={MOVES[33].to} label="After 17. Kf1" /></div></Variants></Specimen>
        <Specimen name="GameViewer" from="chess/GameViewer"><GameViewer moves={PGN} white={{ name: 'Donald Byrne' }} black={{ name: 'Robert James Fischer' }} result="0-1" /></Specimen>
      </Section>

      <Section id="scenario" title="Scenario builder" layout="rail" finding="The instrument every simulation page shares.">
        <Specimen name="MatchRow" from="chess/MatchRow">
          <Rows label="Matches">
            <li><MatchRow home={{ lead: <Flag code="UZB" decorative size="md" />, name: 'Uzbekistan', meta: '#3 seed' }} away={{ lead: <Flag code="IND" decorative size="md" />, name: 'India', meta: '#2 seed' }} probs={WDL} /></li>
            <li><MatchRow home={{ lead: <Flag code="GER" decorative size="md" />, name: 'Germany', emphasis: true }} away={{ lead: <Flag code="HUN" decorative size="md" />, name: 'Hungary' }} result="2½–1½" /></li>
            <li><MatchRow legend="Sindarov against Caruana" home={{ lead: <Avatar size={32} name="Sindarov" src="/players/sindarov.webp" decorative />, name: 'Sindarov' }} away={{ lead: <Avatar size={32} name="Caruana" src="/players/caruana.webp" decorative />, name: 'Caruana' }} options={PICKS} pick={board} onPick={setBoard} /></li>
          </Rows>
        </Specimen>
        <Specimen name="ScenarioPanel" from="chess/ScenarioPanel" note="The list fades while there is more below. With nothing to pick, scroll is none and every row is on the page.">
          <div className="lg:w-96">
            <ScenarioPanel
              title="Pick the results" scroll="lg" round={round} onRound={setRound} tools={<SearchInput aria-label="Find a team" placeholder="Find a team" />} summary={<p className="type-small text-ink-2">1 pick. Uzbekistan beats India.</p>}
              rounds={Array.from({ length: 11 }, (_, i) => ({ key: String(i + 1), label: String(i + 1), state: i < 8 ? ('played' as const) : i === 8 ? ('pairings' as const) : ('projected' as const), dot: i === 9 ? ('pick' as const) : null }))}
              primary={{ label: 'Simulate', onClick: () => {} }} note="1 of 30 picks, not yet simulated" onReset={() => setBoard(null)}
            >
              <MatchRow home={{ lead: <Flag code="UZB" decorative size="md" />, name: 'Uzbekistan' }} away={{ lead: <Flag code="IND" decorative size="md" />, name: 'India' }} options={PICKS} pick={board} onPick={setBoard} probs={WDL} legend="Uzbekistan against India" />
              <MatchRow home={{ lead: <Flag code="GER" decorative size="md" />, name: 'Germany' }} away={{ lead: <Flag code="HUN" decorative size="md" />, name: 'Hungary' }} options={PICKS} onPick={() => {}} probs={WDL} legend="Germany against Hungary" />
              {[['ESP', 'Spain', 'FRA', 'France'], ['POL', 'Poland', 'SRB', 'Serbia'], ['NED', 'Netherlands', 'ENG', 'England'], ['ARM', 'Armenia', 'NOR', 'Norway']].map(([a, home, b, away]) => (
                <MatchRow key={a} home={{ lead: <Flag code={a} decorative size="md" />, name: home }} away={{ lead: <Flag code={b} decorative size="md" />, name: away }} options={PICKS} onPick={() => {}} probs={WDL} legend={`${home} against ${away}`} />
              ))}
            </ScenarioPanel>
          </div>
        </Specimen>
        <Specimen name="Finished match" from="chess/FaceOff" note="Sample state: the match is still being played.">
          <Variant label="champion"><FaceOff variant="feature" sides={SIDES} p1={0} score="5½–7½" scoreLabel="final" champion={{ name: 'Sindarov', line: 'Won 7½–5½ after game 13.' }} /></Variant>
        </Specimen>
      </Section>
    </>
  );
}
