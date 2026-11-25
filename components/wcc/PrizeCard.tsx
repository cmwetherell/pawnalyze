import { Part } from '@/components/layout/Part';
import { Delta } from '@/components/ui/Delta';
import { Meter } from '@/components/ui/Meter';
import { Stat } from '@/components/ui/Stat';
import { Swatch } from '@/components/ui/Swatch';
import { fmtUsd, formatPct } from '@/lib/format';
import { PRIZE } from '@/lib/wcc/config';
import type { Players } from '@/lib/wcc/display';
import type { Prize } from '@/lib/wcc/types';

/** Changes under $500 are noise. */
const SMALLEST_CHANGE = 500;

export function PrizeCard({ prize, base, players }: { prize: Prize; base: Prize | null; players: Players }) {
  const share = (id: 1 | 2, v: number, b: number | undefined) => (
    <Stat
      size="lg"
      label={<span className="inline-flex items-center gap-2"><Swatch tone={id === 1 ? 'p1' : 'p2'} />{players[id].shortName}</span>}
      value={fmtUsd(v)}
      delta={b !== undefined && Math.abs(v - b) >= SMALLEST_CHANGE && <Delta value={v} base={b} unit="plain" format={fmtUsd} />}
      visual={<Meter value={v} max={PRIZE.total} tone={id === 1 ? 'p1' : 'p2'} />}
      sub={`expected, of ${fmtUsd(PRIZE.total)}`}
    />
  );
  return (
    <Part id="prize" title="Expected prize money" finding={<>{PRIZE.rule} {PRIZE.exception}</>}>
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-line pt-6 lg:grid-cols-1 lg:[&>*+*]:border-t lg:[&>*+*]:border-line lg:[&>*+*]:pt-6">
        {share(1, prize.exp1, base?.exp1)}
        {share(2, prize.exp2, base?.exp2)}
        <Stat
          className="col-span-2 border-t border-line pt-6 lg:col-span-1"
          label="Fixed $1.3M / $1.2M split"
          value={formatPct(prize.p_split)}
          delta={base && <Delta value={prize.p_split} base={base.p_split} />}
          sub="Mostly tiebreak finishes; a few very decisive 14-game matches too."
        />
      </div>
    </Part>
  );
}
