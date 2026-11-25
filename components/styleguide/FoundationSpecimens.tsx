import { Logo } from '@/components/layout/Logo';
import { Section } from '@/components/layout/Section';
import { Icon, type IconName } from '@/components/ui/Icon';
import { token, type TokenName } from '@/lib/theme/css';
import { TOKENS } from '@/lib/theme/tokens.generated';
import { Specimen, Variant, Variants } from './Specimen';

const COLOR_GROUPS: { title: string; use: string; tokens: TokenName[] }[] = [
  { title: 'Grounds', use: 'Page, tinted band, wells, floating surfaces, scrim (always with an opacity).', tokens: ['canvas', 'surface', 'sunken', 'raised', 'overlay'] },
  { title: 'Ink', use: 'Headings and figures, body text, meta, text on ink.', tokens: ['ink', 'ink-2', 'ink-3', 'ink-inverse'] },
  { title: 'Lines', use: 'Hairlines, control edges, the 2px section rule.', tokens: ['line', 'control', 'rule'] },
  { title: 'Action and focus', use: 'Primary button, active segment, focus ring.', tokens: ['action', 'action-hover', 'on-action', 'focus'] },
  { title: 'Brand gold', use: 'Link hairline, current page, crown, our own row, ceremony labels. Nothing else.', tokens: ['brand', 'brand-mark', 'brand-wash'] },
  { title: 'Status', use: 'Gain, loss, caution, live. Always with an icon, sign or word.', tokens: ['positive', 'positive-wash', 'negative', 'negative-wash', 'warning', 'warning-wash', 'live', 'live-wash', 'on-live'] },
  { title: 'Match sides', use: 'World Championship pages only. Mark, text, portrait field, row tint, text on the mark.', tokens: ['p1', 'p1-ink', 'p1-field', 'p1-wash', 'on-p1', 'p2', 'p2-ink', 'p2-field', 'p2-wash', 'on-p2', 'draw', 'on-draw', 'on-field'] },
  { title: 'Medals', use: 'Places 1 to 3.', tokens: ['gold', 'silver', 'bronze', 'on-gold', 'on-silver', 'on-bronze'] },
  { title: 'Series', use: 'Categorical, in this order. The color follows the entity, never the rank. on-mid is text on series 4, 5 and 7 and the other mid tones.', tokens: ['series-1', 'series-2', 'series-3', 'series-4', 'series-5', 'series-6', 'series-7', 'series-8', 'on-mid'] },
  { title: 'Chart furniture', use: 'De-emphasized series, gridlines, baseline.', tokens: ['context', 'grid', 'axis'] },
  { title: 'Board', use: 'Squares, last move, coordinates, side markers, evaluation.', tokens: ['board-light', 'board-dark', 'board-mark', 'board-ink', 'piece-white', 'piece-black', 'eval-white', 'eval-black'] },
  { title: 'Complexity', use: 'One teal ramp, Simple to Extreme.', tokens: ['cx-1', 'cx-2', 'cx-3', 'cx-4'] },
];

const paint = (name: TokenName) => ({ backgroundColor: token(name) });

const TYPE: { cls: string; use: string; sample: string }[] = [
  { cls: 'type-figure', use: 'The two headline odds, one pair a page', sample: '84.5%' },
  { cls: 'type-mega', use: 'Landing title, match title', sample: 'Gukesh vs Sindarov' },
  { cls: 'type-h1', use: 'Every other page title', sample: 'Chess Olympiad 2026' },
  { cls: 'type-h2', use: 'Section heading', sample: 'Game 13 is the likeliest finish' },
  { cls: 'type-h3', use: 'Sub-heading, row title, game number', sample: 'World Chess Championship 2026, Geneva' },
  { cls: 'type-stat', use: 'A standalone figure', sample: '28.8%' },
  { cls: 'type-stat-sm', use: 'A smaller standalone figure', sample: '18.0%' },
  { cls: 'type-quote', use: 'Press quote', sample: 'Consistently outperformed his rating strength' },
  { cls: 'type-standfirst', use: 'Verdict under a title', sample: 'Sindarov wins about 85 in 100 matches. 13.6% go to tiebreaks.' },
  { cls: 'type-lead', use: 'Page lead', sample: 'Exact match odds, tournament simulations you can steer, and a complexity score for any position.' },
  { cls: 'type-body', use: 'Running text', sample: 'Choose a result for any game and every number on this page updates at once.' },
  { cls: 'type-button', use: 'Buttons', sample: 'See the match odds' },
  { cls: 'type-ui', use: 'Nav, tabs, segments, sortable heads', sample: 'World Championship' },
  { cls: 'type-data', use: 'Tables, rows, chart values', sample: '2710 2782 15.5% 84.5%' },
  { cls: 'type-small', use: 'Legends, notes, facts', sample: 'Chance to win the match. Each pawn is 1 in 100.' },
  { cls: 'type-label', use: 'Stat labels, dates, units', sample: 'Wed, Nov 25' },
  { cls: 'type-micro', use: 'Chart ticks and photo credits only', sample: 'Photo: Frans Peeters, CC BY-SA 2.0' },
  { cls: 'type-mono', use: 'Moves, FEN, clocks', sample: '17. Kf1 Bxc4+ 18. Kg1 Ne2+' },
];

const SPACE = [['1', 'w-1'], ['2', 'w-2'], ['3', 'w-3'], ['4', 'w-4'], ['6', 'w-6'], ['8', 'w-8'], ['12', 'w-12'], ['16', 'w-16'], ['24', 'w-24'], ['32', 'w-32']] as const;
const NAMED_SPACE = [['gutter', 'w-gutter'], ['section', 'w-section'], ['section-landing', 'w-section-landing'], ['header', 'w-header'], ['bar', 'w-bar'], ['tap', 'w-tap']] as const;

const ICONS: IconName[] = [
  'arrow-right', 'arrow-left', 'external', 'sun', 'moon', 'menu', 'close', 'plus', 'minus', 'chevron-down', 'chevron-up', 'chevron-left', 'chevron-right', 'check', 'copy', 'link', 'share', 'search', 'reset', 'flip', 'sort',
  'clock', 'calendar', 'info', 'warning', 'error', 'medal', 'half-circle', 'circle', 'list', 'first', 'prev', 'next', 'last', 'play', 'pause', 'up', 'down', 'crown', 'pawn', 'x', 'github',
];

export function ColorSpecimens() {
  return (
    <Section id="color" title="Color" layout="rail" finding="Ink on paper, paper on petrol. Every other color is data. Values live in app/tokens.css and nowhere else; switch the theme in the menu to see the other set.">
      {COLOR_GROUPS.map(g => (
        <Specimen key={g.title} name={g.title} note={g.use}>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 xl:grid-cols-4">
            {g.tokens.map(t => (
              <li key={t} className="flex min-w-0 items-center gap-3">
                <span aria-hidden className="h-12 w-12 shrink-0 rounded-sm border border-line" style={paint(t)} />
                <span className="min-w-0">
                  <span className="block type-ui text-ink">{t}</span>
                  <span className="block type-label text-ink-3 dark:hidden">{TOKENS.light[t].slice(4, -1)}</span>
                  <span className="hidden type-label text-ink-3 dark:block">{TOKENS.dark[t].slice(4, -1)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Specimen>
      ))}
    </Section>
  );
}

export function TypeSpecimens() {
  return (
    <Section id="type" title="Type" layout="wide" finding="Pawnalyze Display carries headlines and standalone figures in one weight. Hanken Grotesk does everything else. Numbers that stack in a column are always type-data.">
      <dl>
        {TYPE.map(t => (
          <div key={t.cls} className="grid grid-cols-1 gap-x-6 gap-y-2 border-t border-line py-4 first:border-t-0 lg:grid-cols-12 lg:items-baseline">
            <dt className="lg:col-span-3">
              <span className="block type-mono text-ink">{t.cls}</span>
              <span className="block type-label text-ink-3">{t.use}</span>
            </dt>
            <dd className="min-w-0 lg:col-span-9"><span className={`block text-ink ${t.cls}`}>{t.sample}</span></dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function FrameSpecimens() {
  return (
    <Section id="frame" title="Space, shape, motion" layout="rail" finding="Spacing uses ten steps and six named sizes that change with the screen. Corners are near square. Motion is the hero entrance, hover and press, and data changes.">
      <Specimen name="Space">
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SPACE.map(([n, w]) => <li key={n} className="flex items-center gap-3"><span className="w-8 type-mono text-ink-3">{n}</span><span aria-hidden className={`h-3 bg-context ${w}`} /></li>)}
          {NAMED_SPACE.map(([n, w]) => <li key={n} className="flex items-center gap-3"><span className="w-32 type-mono text-ink-3">{n}</span><span aria-hidden className={`h-3 bg-context ${w}`} /></li>)}
        </ul>
      </Specimen>
      <Specimen name="Shape and shadow" note="sm: controls, bars, cells, flags. md: panels, menus, tooltips. lg: sheets. full: avatars, medals, dots. Only floating surfaces have a shadow.">
        <Variants>
          {([['sm', 'rounded-sm'], ['md', 'rounded-md'], ['lg', 'rounded-lg'], ['full', 'rounded-full']] as const).map(([n, r]) => (
            <Variant key={n} label={n}><span aria-hidden className={`h-16 w-16 bg-context ${r}`} /></Variant>
          ))}
          <Variant label="shadow-pop"><span aria-hidden className="h-16 w-24 bg-raised shadow-pop" /></Variant>
        </Variants>
      </Specimen>
      <Specimen name="Motion" note="press 90, out 120, in 150, slide 240, data 450, image 600, enter 700 milliseconds. All are 0 under reduced motion. Hover this row to see the steps.">
        <div className="group/motion flex flex-col gap-2">
          {([['duration-press', 'duration-press'], ['duration-in', 'duration-in'], ['duration-slide', 'duration-slide'], ['duration-data', 'duration-data'], ['duration-image', 'duration-image']] as const).map(([n, d]) => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-32 type-mono text-ink-3">{n}</span>
              <span aria-hidden className="h-3 flex-1 overflow-hidden rounded-sm bg-sunken"><span className={`block h-full w-full origin-left scale-x-[.1] rounded-sm bg-ink transition-transform group-hover/motion:scale-x-100 ${d}`} /></span>
            </div>
          ))}
        </div>
      </Specimen>
      <Specimen name="Icon" from="ui/Icon" note="One set, four sizes. Decorative: the control around an icon carries the name.">
        <ul className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 xl:grid-cols-6">
          {ICONS.map(n => <li key={n} className="flex min-w-0 items-center gap-2 text-ink"><Icon name={n} /><span className="truncate type-label text-ink-3">{n}</span></li>)}
        </ul>
        <Variants className="mt-6 text-ink">{([14, 16, 20, 24] as const).map(s => <span key={s} className="inline-flex items-center gap-2"><Icon name="calendar" size={s} /><span className="type-label text-ink-3">{s}</span></span>)}</Variants>
      </Specimen>
      <Specimen name="Logo" from="layout/Logo">
        <Variants className="gap-x-8"><Logo className="h-[38px]" /><Logo kind="pawn" /></Variants>
      </Specimen>
    </Section>
  );
}
