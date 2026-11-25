# Pawnalyze design system: Scoresheet

Pawnalyze is a chess graphics desk. Every page is set like a page of a serious newspaper's data section: a serif that can carry a headline and a fraction, ruled sections instead of boxes, and colour that only ever means data. This file is the whole contract. If something you need is not here, add it here and to the library first, then use it.

Contents: 1 Principles. 2 Tokens. 3 Tailwind. 4 Fonts and type. 5 Layout. 6 Motion. 7 Charts. 8 Component library. 9 Rules against drift. 10 Copy. 11 Pages. 12 OG images. 13 Assets and licences. 14 Build order and ownership. 15 Acceptance.

Files that ship with this document (`design/`):

| From | To in the repo |
|---|---|
| `tokens.css` | `app/tokens.css` (imported first in `app/layout.tsx`) |
| `tailwind.config.ts` | `tailwind.config.ts` (replace) |
| `scripts/check-theme.mjs`, `scripts/check-drift.mjs`, `scripts/gen-tokens.mjs` | `scripts/` |
| `fonts/final/*` | `assets/fonts/` |
| `assets/players/*` | `public/players/wcc/` |
| `assets/game-of-the-century.json` | `lib/elocator/game-of-the-century.json` |

How the direction was chosen: judges' totals were Scoresheet 23.8, Instrument 23.6, Broadcast 21.8. Scoresheet supplies the look (type, rules, face-off, pawn bar, petrol palette). Instrument supplies the engineering (token-only sizes, sticky section bar with live odds, hairline stat cells, ruled race table, recompute everywhere, petrol action colour in light). Broadcast supplies the controls (pick buttons that hold the percentage, one-row-per-game phone list, odds chip and phone bottom bar, data/field/ink split per player, Elocator's single teal ramp, aligned market bars).

---

## 1. Principles

1. **Rules, not boxes.** A 2px `rule` opens a section; 1px `line` separates rows. `Panel` (the only box) is for instruments people operate: the scenario builder, the what-if lab, the Elocator input, the live board, a team spotlight, a sheet. Static charts, tables and text sit on the ground.
2. **Colour means data.** Orange, blue, medals, series and teal appear only on data, players, flags and photographs. The interface is ink on paper (dark: paper on petrol).
3. **Gold has five small jobs:** the link hairline, the current-page mark, the champion's crown, the marker on Pawnalyze's own row among the markets, and ceremony labels in the calendar (with brand `Tag`/`Callout` washes for titles and archive notes). Gold medals use their own token. Gold is never a button, focus ring, chart line or heading.
4. **Say the finding first.** Every data section states in words what its figure shows, computed from the data, next to the figure.
5. **One of each.** One container width, one button pair, one segmented control, one table, one legend, one tooltip, one heading scale, one radius scale.
6. **The answer follows you.** On a dashboard the live number is always on screen: in the hero, then in the section bar (desktop) or bottom bar (phone).
7. **Nothing by colour alone.** Names, letters, position, hatch or direct labels carry every distinction too.
8. **Readable at arm's length.** Data 15px, text 16px, labels 13 to 14px; 12px is for chart ticks and photo credits only.

---

## 2. Tokens

`app/tokens.css` is the only file in the repo with colour literals. Colours are `R G B` channel triplets so Tailwind opacity modifiers work. Light on `:root`, dark on `.dark` (the existing class on `<html>`, default dark). Verified by `scripts/check-theme.mjs`: every pair of `fillClass` and `onClass` included, 0 failures (text 4.5:1 on every ground it may use, `ink`/`ink-2` 7:1, marks and control edges 3:1). Series 1 to 8, p1/p2 and the four complexity steps pass the colour-blind validator in both themes on `canvas` and `surface`. There is no violet and none may be added.

### 2.1 Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | #fbfcfa | #0a1418 | page ground |
| `surface` | #f0f3f1 | #101e24 | tinted band, panel, table hover |
| `sunken` | #e4e9e6 | #1a2b32 | bar tracks, hover fills, wells |
| `raised` | #ffffff | #14242b | sheets, menus, tooltips, inputs |
| `overlay` | #09141a | #03080a | scrim; always used with an opacity |
| `ink` | #0c1f2b | #f1f4f0 | headings, figures, primary text |
| `ink-2` | #384a54 | #bcc8c9 | body text, labels that carry data |
| `ink-3` | #55666f | #93a2a6 | meta, axis ticks, credits |
| `ink-inverse` | #fbfcfa | #0a1418 | text on ink |
| `line` | #d6ddda | #23343b | hairlines between rows; default border colour |
| `control` | #6f7e86 | #6b7f86 | 3:1 edge of inputs, toggles, chips, axes |
| `rule` | #0c1f2b | #cdd6d3 | the 2px section rule |
| `action` | #023048 | #f1f4f0 | primary button, active segment (logo petrol in light) |
| `action-hover` | #0b4a6b | #cfd8d5 | hover of action |
| `on-action` | #ffffff | #0a1418 | text on action |
| `focus` | #023048 | #f1f4f0 | 2px focus ring |
| `brand` | #7a5a08 | #e0bd68 | gold as text |
| `brand-mark` | #a67c12 | #cfa84a | gold as a line or glyph |
| `brand-wash` | #f5eeda | #241e0f | our own row in the markets table |
| `positive` | #0f7045 | #4ec48c | gain, success text |
| `positive-wash` | #e1f0e8 | #0f2b21 | success callout |
| `negative` | #b3263a | #f2788a | loss, error text |
| `negative-wash` | #f9e4e6 | #33181d | error callout |
| `warning` | #8a5a00 | #e6ae4a | caution text |
| `warning-wash` | #f7ecd4 | #2b210f | caution callout |
| `live` | #c8102e | #f0566a | live dot and label |
| `live-wash` | #fbe3e6 | #35161b | live tag |
| `on-live` | #ffffff | #0a1418 | text on live |
| `p1` | #cc4a14 | #e8662f | Gukesh: data marks |
| `p1-ink` | #a8380a | #ff8a58 | Gukesh: text |
| `p1-field` | #c33c0b | #c33c0b | Gukesh: portrait block |
| `p1-wash` | #fbe9e1 | #2c180f | Gukesh: picked cell, row tint |
| `on-p1` | #ffffff | #0a1418 | text on p1 |
| `p2` | #1c69c9 | #3f8bea | Sindarov: data marks |
| `p2-ink` | #1a5fb5 | #6fb0ff | Sindarov: text |
| `p2-field` | #1a5bc9 | #1a5bc9 | Sindarov: portrait block |
| `p2-wash` | #e3edf9 | #10223a | Sindarov: picked cell, row tint |
| `on-p2` | #ffffff | #0a1418 | text on p2 |
| `draw` | #7a8891 | #788382 | draw / still level |
| `on-draw` | #0c1f2b | #0a1418 | text on draw |
| `on-field` | #ffffff | #ffffff | text on p1-field or p2-field |
| `gold` | #a97e0a | #e3bb52 | gold medal and first place |
| `silver` | #748a99 | #b3c4d0 | silver medal |
| `bronze` | #95501f | #c87f48 | bronze medal |
| `on-gold` | #0c1f2b | #0a1418 | text on gold |
| `on-silver` | #0c1f2b | #0a1418 | text on silver |
| `on-bronze` | #ffffff | #0a1418 | text on bronze |
| `series-1` | #1c69c9 | #3f8bea | categorical series 1 |
| `series-2` | #cc4a14 | #e8662f | categorical series 2 |
| `series-3` | #0a7d63 | #21a673 | categorical series 3 |
| `series-4` | #b07d00 | #c08a12 | categorical series 4 |
| `series-5` | #cf4a86 | #e0628f | categorical series 5 |
| `series-6` | #3f7d1e | #6f9f2a | categorical series 6 |
| `series-7` | #0a8ca6 | #1aa0bd | categorical series 7 |
| `series-8` | #c02f3d | #e05563 | categorical series 8 |
| `on-mid` | #050b0e | #000000 | text on the mid tones: context, cx-1, series 4, 5, 7, brand-mark |
| `context` | #7c8b93 | #667a82 | de-emphasised series |
| `grid` | #e2e8e5 | #1b2a30 | gridlines |
| `axis` | #6f7e86 | #6b7f86 | baseline |
| `board-light` | #e8ece4 | #cbd6d0 | light squares |
| `board-dark` | #8fa6a0 | #7a9691 | dark squares |
| `board-mark` | #d9b347 | #d9b347 | last move, at 55% |
| `board-ink` | #0c1f2b | #0a1418 | coordinates |
| `piece-white` | #ffffff | #f1f4f0 | side marker |
| `piece-black` | #0c1f2b | #050b0e | side marker |
| `eval-white` | #fbfcfa | #f1f4f0 | White share of the eval bar |
| `eval-black` | #0c1f2b | #050b0e | Black share of the eval bar |
| `cx-1` | #48958f | #33817c | 1-25 Simple |
| `cx-2` | #1f7773 | #46a9a1 | 26-50 Moderate |
| `cx-3` | #0b5757 | #7dd3c9 | 51-75 Complex |
| `cx-4` | #053838 | #cbf6ee | 76-100 Extreme |

Rules of use:

- **Text colours:** `ink`, `ink-2`, `ink-3`, `brand`, `positive`, `negative`, `warning`, `live`, `p1-ink`, `p2-ink` and the `on-*` tokens. Never put text in `p1`, `p2`, `series-*`, `gold`, `silver`, `bronze`, `draw` or `control`. Never put an opacity modifier on a text colour.
- **Player identity:** `p1`/`p2` for every mark, in every chart, both themes (one data shade). `p1-field`/`p2-field` only behind a portrait. `p1-ink`/`p2-ink` only for words. `p1-wash`/`p2-wash` only for a tinted row or cell. These six belong to the World Championship 2026 pages, the live page, the home and index face-off and their OG image. Everything else uses `series-*`.
- **Results:** win = `ink` fill, draw = `draw` fill, loss = outline only (`control` inset). Same in pips and W/D/L bars, so result never rests on red against green. Deltas use `positive`/`negative` plus an arrow glyph and a sign.
- **Opacity modifiers** are allowed on `overlay/60`, `board-mark/55` and area fills `/15`. Nowhere else.
- **Hatch** (`.hatch`) means "still level, goes on". Nothing else.

### 2.2 Everything else

| Group | Tokens |
|---|---|
| Type sizes | `--t-figure 50..128`, `--t-mega 38..112`, `--t-h1 34..64`, `--t-h2 26..36`, `--t-h3 22`, `--t-stat 30..44`, `--t-stat-sm 26`, `--t-quote 24..38`, `--t-standfirst 19..25`, `--t-lead 18`, `--t-body 16`, `--t-data 15`, `--t-small 14`, `--t-label 13`, `--t-micro 12` |
| Frame | `--page 1280`, `--reading 680`, `--gutter 20 / 48 / 80`, `--section 56 / 72 / 80`, `--section-landing 72 / 104 / 120`, `--header 60 / 72`, `--bar 52 / 56`, `--bottom-bar 0` (set by BottomBar), `--tap 44` (phone / from 768 / from 1280) |
| Radius | `--r-sm 2` controls, bars, cells, flags. `--r-md 4` panels, menus, tooltips. `--r-lg 6` sheets. `--r-full` avatars, medals, dots |
| Shadow | `--shadow-pop`: menus, tooltips, sheets. Nothing at rest has a shadow |
| Motion | `--m-press 90`, `--m-out 120`, `--m-in 150`, `--m-slide 240`, `--m-data 450`, `--m-image 600`, `--m-enter 700` ms; `--ease`, `--ease-enter`. All 0ms under reduced motion |
| Filters | `--logo-filter`, `--press-filter` (white logos in dark) |

`lib/theme/css.ts` exports `token(name: TokenName, alpha = 1)` returning the CSS string for SVG attributes and dynamic tones; it is the only place that writes that function. `lib/theme/tones.ts` exports:

```ts
export type Tone = 'ink' | 'context' | 'p1' | 'p2' | 'draw' | 'win' | 'loss' | 'level' | 'gold' | 'silver' | 'bronze'
  | 'positive' | 'negative' | 'brand' | 'cx-1' | 'cx-2' | 'cx-3' | 'cx-4' | `series-${1|2|3|4|5|6|7|8}`;
export const fillClass: Record<Tone, string>;   // 'bg-p1', 'bg-series-3', 'hatch' for level, ...
export const onClass: Record<Tone, string>;     // text colour on that fill
export const strokeVar: (t: Tone) => string;    // token(...) for SVG
export const playerTone = (id: 1 | 2): 'p1' | 'p2';
export const medalTone = (rank: 1 | 2 | 3): 'gold' | 'silver' | 'bronze';
export const complexityTone = (score: number): 'cx-1'|'cx-2'|'cx-3'|'cx-4'; // 1-25, 26-50, 51-75, 76-100
export const complexityWord = (score: number): 'Simple' | 'Moderate' | 'Complex' | 'Extreme';
export const seriesTone = (slot: number): Tone; // 0 -> series-1 ... 7 -> series-8, then 'context'
```

`lib/playerData.ts`: `PLAYER_COLORS` and every `color` field become `tone: Tone`. Old index to series: 0→1, 1→8, 2→3, 3→4, 4→6, 5→5, 6→7, 7→2; then swap so Sindarov is `series-1`, Nakamura `series-2`, and Gukesh (2024) `series-2`. `getPlayerColor` becomes `getPlayerTone`, `buildPlayerColorMap` becomes `buildPlayerToneMap`.

---

## 3. Tailwind

Use the supplied `tailwind.config.ts` unchanged. It **replaces** the palette, font sizes, weights, radii, shadows and z-index, so `bg-red-500`, `text-white`, `text-sm`, `rounded-xl`, `shadow-lg` and `z-50` do not exist (they compile to nothing, and the drift check fails them). The default border colour is `line`, which fixes the near-white table rules.

Useful names it adds: colours by token (`bg-surface`, `text-ink-2`, `border-control`, `fill-p1`), `type-*` styles, `p-gutter`, `py-section`, `h-header`, `h-bar`, `min-h-tap`, `min-h-hero`, `max-w-page`, `max-w-reading`, `scroll-mt-bar`, `pb-safe`, `pb-bottom-bar`, `z-bar|header|tooltip|sheet|skip`, `duration-in|out|press|slide|data|image`, `ease-enter`, `animate-rise|up|settle|grow|wipe|live-dot|sheet|fade|skeleton`, utilities `tnum`, `hatch`, `press`, `logo`, `scrollbar-none`.

Spacing uses Tailwind's 4px scale, steps 1, 2, 3, 4, 6, 8, 12, 16, 24, 32 (4 to 128px) only.

`lib/utils.ts` (no clsx; it is not a declared dependency):

```ts
import { extendTailwindMerge, twJoin, type ClassNameValue } from 'tailwind-merge';
const merge = extendTailwindMerge<'type'>({ extend: { classGroups: { type: [{ type: [() => true] }] } } });
export const cn = (...i: ClassNameValue[]) => merge(twJoin(...i));
```

`app/layout.tsx` imports `./tokens.css`, then `flag-icons`, then `./globals.css`. `app/globals.css` becomes about 40 lines: the three Tailwind layers and a base layer with: `html { -webkit-text-size-adjust: 100% }`, `[id], :focus-visible { scroll-margin-top: calc(var(--bar) + 24px) }` (a margin, not `scroll-padding`: the two would add up), `html, body { overflow-x: clip }`, `body` = `bg-canvas text-ink type-body antialiased`, `:focus-visible { outline: 2px solid rgb(var(--focus)); outline-offset: 2px; border-radius: var(--r-sm) }`, `::selection` in brand-wash with ink, `.sr-only { left: 0 }` (a second guard against the scroll-row bug), and `body:has([data-sheet-open]) { overflow: hidden }`. Delete the 280-line chess-results flag sprite block and `public/img/flag30V.png` once Budapest 2024 uses `Flag`.

`app/layout.tsx` viewport: `{ width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: [{ media: '(prefers-color-scheme: light)', color: TOKENS.light.canvas }, { media: '(prefers-color-scheme: dark)', color: TOKENS.dark.canvas }] }`. Never set `maximumScale` or `userScalable`.

---

## 4. Fonts and type

All through `next/font`, declared once in `app/fonts.ts`:

```ts
import { Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
export const display = localFont({ src: '../assets/fonts/PawnalyzeDisplay-opsz.woff2', weight: '420', variable: '--font-display', display: 'swap', adjustFontFallback: 'Times New Roman' });
export const text = Hanken_Grotesk({ subsets: ['latin', 'latin-ext'], variable: '--font-text', display: 'swap' });
export const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap', preload: false });
```

- **Pawnalyze Display** is Merriweather (OFL) pinned to width 87, weight 420, with its optical-size axis kept, subset to Latin and renamed as its licence requires: 90KB instead of Google's 369KB three-axis file. Ship `OFL-Merriweather.txt` beside it. It exists in one weight; never bold it or set it in italics.
- **Hanken Grotesk** 400/500/600 does everything else. **JetBrains Mono** only for FEN, PGN, SAN moves and clocks.
- Delete Inter and `assets/fonts/CalSans-SemiBold.woff2`.

| Style | Face | Size | Leading / tracking | Use |
|---|---|---|---|---|
| `type-figure` | Display | 50 to 128 | .88 / -.025em | the two headline odds, one pair a page |
| `type-mega` | Display | 38 to 112 | 1 / -.022em | landing h1; "Gukesh vs Sindarov" |
| `type-h1` | Display | 34 to 64 | 1.04 / -.02em | every other page title |
| `type-h2` | Display | 26 to 36 | 1.12 / -.016em | section heading |
| `type-h3` | Display | 22 | 1.25 / -.008em | sub-heading, row title, game number |
| `type-stat` / `type-stat-sm` | Display | 30 to 44 / 26 | 1 | a standalone figure, never one that stacks in a column |
| `type-quote` | Display | 24 to 38 | 1.24 | press quote |
| `type-standfirst` | Display | 19 to 25 | 1.38 | verdict under a title |
| `type-lead` | Text | 18 | 1.55, `ink-2` | page lead |
| `type-body` | Text | 16 | 1.6 | running text |
| `type-button` | Text 500 | 16 | 1.2 | buttons |
| `type-ui` | Text 500 | 15 | 1.3 | nav, tabs, segments, table heads that sort |
| `type-data` | Text | 15 | 1.4, tabular | tables, rows, chart values |
| `type-small` | Text | 14 | 1.5 | legends, notes, facts |
| `type-label` | Text | 13 | 1.4 | stat labels, dates, units |
| `type-micro` | Text | 12 | 1.45 | chart ticks, photo credits |
| `type-mono` | Mono | 14 | 1.55 | moves, FEN, clocks |

Rules: one `type-*` per element. **Numbers that stack in a column are always `type-data`** (tabular Hanken); the serif is for figures that stand alone. Sentence case everywhere; no tracked capitals, no eyebrows. Colour is separate (`type-h2 text-ink`). Headings step down one level at a time. A long title (over 22 characters, for example "United States of America" in the podium) drops one style via `fitTitle()` in `components/ui/Heading.tsx`. Measure: `max-w-reading` for paragraphs.

---

## 5. Layout

### 5.1 Frame

- One content width: `Container` = `width: min(100% - 2 * gutter, 1280px)`. Header, hero, sections, section bar, footer and bottom bar share its edges. `size="reading"` (680) is only for running text, left-aligned to the container's left edge, never centred.
- 12-column grid, 24px gap, inside a `Section`. Breakpoints 640, 768, 1024, 1280.
- Grounds: `canvas`, and one `surface` band per movement. No other grounds.
- Phone: one column, 20px gutter, buttons full width, 44px targets (real size, no negative-inset pseudo-elements).
- `Page` sets `overflow-x: clip`. **A scroll row is always `position: relative`** (a real bug here: absolutely positioned `sr-only` text inside an unpositioned overflow container widened the page to 2280px on phones, which is why the owner could zoom out). Therefore `overflow-*-auto` is banned outside `ScrollRow`, `ScrollArea`, `Table` and `Sheet`, all of which set `relative`.
- `scripts/qa` overflow check at 320, 360, 390, 430, 768, 1024, 1440 on every route: `scrollWidth === clientWidth` on `documentElement`, and no element's right edge past the viewport unless it is inside `[data-scroll-row]`.

### 5.2 Site header and footer

- `SiteHeader`: `h-header`, `bg-canvas`, 1px `line` underneath, logo left (`Logo`, inline SVG in `ink`, height 28/32), links right: World Championship, Simulations, Elocator, About, Blog (external icon). `World Championship` points to `/world-chess-championship-2026` and shows a `LiveDot` while a game is live only if the page already knows (no new client polling in the header). Current page: 2px `brand-mark` bar on the header's bottom edge plus `aria-current="page"`. Theme toggle shows the icon of the theme you would switch to (sun in dark, moon in light) with a matching label.
- Sticky on landing pages. On any page that renders `SectionBar` it scrolls away: `sticky top-0 group-has-[[data-section-bar]]/body:static` (body has `group/body`). No JS.
- Under 768: logo, theme toggle, menu button (`aria-expanded`) opening a full-screen `Sheet side="full"` with 56px rows; closes on navigation, Escape and backdrop.
- `SkipLink` is the first focusable element, to `#main`.
- `SiteFooter`: 2px `rule` on top; logo and sentence (4 cols), Tools, Tournaments, Social (X and GitHub as text links with icons). Legal row: copyright left, credits link right. Pages with photographs pass credits through the page's own credit lines, not the footer.

### 5.3 Sections

`Section` layouts (from 1024; below that everything stacks, words first):

| `layout` | Columns | Use |
|---|---|---|
| `rail` (default) | 3 words + 9 figure | one figure with a finding. The words are `sticky` under the bar while a taller figure scrolls, and the legend and table toggle live in the rail, so it is never blank |
| `wide` | heading row (4 + 5 + 3 for actions), figure below at 12 | games sheet, clinch chart, tables over 6 columns |
| `split` | 6 + 6 (or `ratio="5/7"`, `"7/5"`) | two related figures under one heading |
| `plain` | 12 | text, rows, quotes |

A section opens with the 2px rule, 24px, then the `h2`. Padding below: `section`. Landing pages use `pace="landing"`: padding `section-landing`, `min-h-screen` from 1024 so one section holds a screen, content top-aligned, filled to at least 70% of the screen or merged into its neighbour. Dashboards use normal pace and no minimum height. `SectionGroup` wraps sections into a movement with a ground; a `surface` group bleeds full width and pads `section` top and bottom.

### 5.4 Dashboard shell

Order: `SiteHeader` (static), `PageHead`, hero figure, `SectionBar` (sticky, `top-0`, `h-bar`), groups of sections, `SiteFooter`, `BottomBar` (phones).

- **PageHead**: breadcrumb; title; on the right (desktop) or below (phone) a facts column in `type-small` with the first fact in `font-medium text-ink`; optional status `Tag`, actions, sibling `Segmented` (Open / Women) at the right end of the breadcrumb line, and section `Tabs` along the bottom. On phones the first data figure must start within 440px of the top at 390x844: title on one line where it fits, facts cut to one line plus a "Details" disclosure.
- **SectionBar**, desktop: left a 28px pawn glyph link to home (global navigation while the header is gone); then the live slot (`OddsChip` or event name), which fades in when the hero sentinel leaves view; centre the section links (`type-ui`, 2px `ink` bar on the current one, `aria-current="location"`, 1px `line` between groups); right the actions (Reset, Share) and a menu `IconButton` that opens the same site menu. At most 8 links; every anchor that exists today stays valid, and the full list with group headings is in the "All sections" disclosure.
- **SectionBar**, phone: pawn glyph, one disclosure button reading the current section ("Scenarios", chevron) opening a two-column grouped list with 48px rows, menu button. No odds here (the bottom bar has them).
- Scroll spy: `IntersectionObserver`, rootMargin `-20% 0px -70% 0px`. Anchors use `scroll-mt-bar`.
- **BottomBar** (under 1024 only): fixed, `bg-raised`, 1px `control` top line, height 64 + `env(safe-area-inset-bottom)`, sets `--bottom-bar` on `body` so `Page` pads by it (`pb-bottom-bar`), and is hidden (translated and `inert`) until the hero sentinel has left view and while a text field has focus. Contents: WCC = two solid halves with name and live percentage (tap jumps to `#scenario`), Reset when there are picks, Share. Olympiad live = builder button with pick count + Simulate. Nothing on finished Olympiads or Candidates with no picks. It never covers content.

### 5.5 Tables on phones

Columns carry a `priority` (1 always, 2 from 640, 3 from 768, 4 from 1280). The name column takes the remaining width and truncates. Tables never scroll sideways except `TableFallback`.

---

## 6. Motion

Three places only: the hero enters once, the hover/press layer, and data changes. Nothing moves because the page scrolled.

| What | How |
|---|---|
| Hero entrance | `HeroEnter` wrapper, once per load: title lines `animate-rise` (80ms apart), then lead and buttons `animate-up` (60ms apart, from 400ms). Portrait block `animate-grow`, portrait `animate-settle`. Server-rendered content is visible without JS and under reduced motion |
| The one moment | **Pawn bar deal**: 100 pawns stand in `draw` grey, then the two colours wipe in left to right once (`animate-wipe` on the coloured layer's wrapper, 900ms). Animate the wrapper only, never 100 SVG children |
| Buttons | hover fill step and 1px up, press 1px down and scale .985 (`duration-press`) |
| Links | hairline 1px grows to 2px |
| Rows that link | background to `surface`, title underlines |
| Photo in a link | scale 1.025 inside its frame, 600ms |
| Tabs, segments | state change, 150ms colour; no sliding pill |
| Data | numbers tween (`useTween`, 450ms), bar widths and heights transition `duration-data`; lines do not animate |
| Sheet, menu | `animate-sheet` / `animate-fade` |
| Live | `LiveDot` pulses 2s; the only loop on the site |
| Simulated match | existing step timer, 420ms, with "Skip to the end" |

Hover only inside `@media (hover: hover) and (pointer: fine)` (use Tailwind `hover:` on colour only; transforms go through component classes guarded by that query). Focus ring appears instantly. `usePrefersReducedMotion` and `useTween` move to `hooks/`.

---

## 7. Charts

Everything is custom SVG from `components/charts`, sized by `useSize` (ResizeObserver) and drawn at real pixels so text never shrinks on phones. `chart.js`, `react-chartjs-2`, `chartjs-plugin-datalabels` and `recharts` imports are removed from pages: `DisplayEval`, `currentPredictions`, `MedalChart`, `WCCSims` migrate to `LineChart`/`BarRows`. If a migration truly blocks, `components/charts/adapters.ts` is the only file that may import them, through `useChartTheme()` (resolved token strings, re-read on theme change) and shared option builders. Uninstall the four packages when the adapter file is empty.

- **Frame.** `ChartFrame` renders: optional caption line (`type-small`, what the y axis is), the plot, legend, and `TableFallback`. SVG has `role="img"` and an `aria-label` that states the finding. Every chart has a table.
- **Axes.** Ticks `type-micro ink-3`, tabular. Gridlines 1px `grid`, solid. Baseline 1px `axis`. No y axis line, no tick marks, no axis titles (the caption says it). The unit is on the top tick only ("100%", then 75, 50). Phone: every second or third x label, never rotated.
- **Domain.** Percent charts run 0 to the next of 25, 50, 75, 100 above the maximum. Bars always start at 0. A future region (games not played) is empty ground with a 1px dashed `line` at "now".
- **Line.** 1.75px; the emphasised series 3px over a 7px ground-coloured halo with a 6px end dot. At most one `strong` series; others `context` (1.5px). Hover or focus on a label promotes that series to its own `series-*` tone. When five or fewer series matter equally (player against player, live charts) each takes its tone and all are direct-labelled.
- **Labels, not legends.** End labels right of the plot, 15px 600 for strong, 14px `ink-3` for context, resolved by the existing push-down/push-up solver with 20px minimum gap (22 on phones) and a 1px leader when moved more than 8px. A label may never sit on a line: it gets a 5px ground-coloured stroke halo and is nudged. Under 560px names shorten to federation code or short name, the gutter is at most 80px, the value goes under the name, and a reference is named on its line inside the plot. A context label with no clear spot within 12px of its own line, nearer to it than to any other, is left out (tooltip and table have it). A legend appears only when marks repeat (bars, scatter markers) and uses `Legend`.
- **Peak.** In column charts the largest value is set in `type-stat-sm`; the rest in `type-small`. Columns: 2px gaps, radius 2 on the outer end.
- **Split and stacked bars.** 2px gaps; height 12 (28 to 34 with inside labels); a segment under 8%, or too narrow for its label, shows no inside label but stays in the aria-label and table. Zero value: no bar and no track, just "0.0%" in `ink-3`. Race tables have a ruled header 0/25/50/75/100% with faint full-height ticks.
- **Tooltip and crosshair.** One `ChartTooltip` (raised, 1px `line`, `shadow-pop`, 220px max, `type-small`, values tabular and right-aligned, sorted high to low, six rows at most) and a 1px `ink-3` crosshair. Pointer, touch (drag) and keyboard (arrow keys move, Escape clears). It flips side near the edge and never covers a control. It keeps off the strong end label.
- **Colour** follows the entity, never the rank. Sequential = teal ramp. Medals = medal tokens. Match sides = p1/p2. No gradient fills; areas at 15%.
- **Preview.** Hovering or focusing a pick shows the resulting odds in the `OddsChip`/hero figure slot as "would be 34.3%" (`Delta`), not in a floating box over neighbouring buttons.

---

## 8. Component library

Server components unless marked **C** (client). Every component takes `className?` for layout only (margin, grid placement, width), never for colour, type or radius. Icons, labels and sizes are props. `children` omitted where obvious.

### 8.1 Layout: `components/layout`

| Component | Props and variants | Replaces |
|---|---|---|
| `Page` | `kind: 'landing' \| 'dashboard'` | every `<main className="flex-1 flex flex-col min-h-screen">` (17 files) |
| `Container` | `size?: 'page' \| 'reading'`, `as?` | 43 ad-hoc `max-w-4xl/5xl/6xl/7xl/[1400px] mx-auto px-4 sm:px-6` |
| `SiteHeader` **C** | none | `components/navbar.tsx` |
| `SiteMenu` **C** | `trigger` render prop; used by SiteHeader and SectionBar | navbar dropdown |
| `SiteFooter` | none | `components/Footer.tsx` |
| `ThemeProvider`, `ThemeToggle` **C** | unchanged API | `components/ThemeProvider.tsx` (moves) |
| `SkipLink` | none | new |
| `PageHead` | `title`, `size?: 'mega' \| 'h1'`, `crumbs?: {label, href?}[]`, `lead?`, `facts?: ReactNode[]`, `status?: ReactNode`, `actions?`, `switcher?: LinkItem[]`, `tabs?: LinkItem[]`, `media?` (AvatarStack, FlagStack, Photo), `enter?: boolean` | `TournamentHeader`, `FaceOffHero` header, live page header, `PlayerPage` header and breadcrumb, home, simulations, Elocator, about headings |
| `Breadcrumb` | `items: {label, href?}[]` | FaceOffHero nav, TournamentHeader trail, PlayerPage nav, live nav |
| `Section` | `id?`, `title`, `finding?`, `actions?`, `legend?`, `credit?`, `layout?: 'rail' \| 'wide' \| 'split' \| 'plain'`, `ratio?`, `pace?: 'dashboard' \| 'landing'`, `rule?: boolean`, `level?: 2 \| 3` | `wcc/ui Section`, TeamSpotlight `Section`, HeroPanel, TeamTable, SimulationResults and every `surface-card` section shell (62 uses in 32 files) |
| `SectionGroup` | `label`, `ground?: 'canvas' \| 'surface'` | ungrouped stacks |
| `SectionBar` **C** | `groups: {label, items: {id, label, also?: string[]}[]}[]`, `live?`, `actions?`, `heroId` | WccDashboard NAV |
| `BottomBar` **C** | `label`, `heroId` | WCC and Olympiad fixed bars |
| `Split` | `main`, `aside`, `asideWidth?: 'narrow' \| 'wide'`, `stickyAside?` | `lg:grid-cols-5` panels in SimulationResults, OlympiadDashboard; player page aside |
| `HeroEnter` **C** | `children` | `animate-fade-in-up` |

### 8.2 Primitives: `components/ui`

| Component | Props and variants | Replaces |
|---|---|---|
| `Button` | `variant?: 'primary' \| 'secondary' \| 'quiet'`, `size?: 'md' 48 \| 'sm' 44`, `href?` (renders Link or external a), `icon?`, `iconEnd?`, `loading?`, `full?`, `live?` (dot before label), button attributes | `components/Button.tsx`; gold/outline links on home, not-found, about; Simulate, Analyze, Deal, Reset, Reload, Dismiss, Skip, Show more, Apply results (most of 93 raw buttons) |
| `IconButton` | `icon`, `label`, `href?`, `size?: 44`, `pressed?` | theme toggle, menu, close, prev/next team and player, board controls, `ctrl`, `navBtnClass`, scroll arrows |
| `TextLink` | `href`, `external?`, `quiet?` | every `text-gold-ink hover:underline`, `text-chess-gold`, `Link ... &rarr;` |
| `Icon` | `name: IconName`, `size?: 14 \| 16 \| 20 \| 24` | 57 inline SVGs, `react-icons` in Footer (kept only inside Icon for X and GitHub), `⏮◀▶⏭⇅`, `→`, `↗`, `✓●◐`, `▲▼` (as `up`/`down`) |
| `Heading` | `level: 1..4`, `style: 'mega' \| 'h1' \| 'h2' \| 'h3'`, `fit?` | all `font-heading` headings |
| `Prose` | children (p, ul, a styled) at reading measure | about body, methodology text |
| `Tag` | `tone?: 'neutral' \| 'live' \| 'positive' \| 'negative' \| 'warning' \| 'brand'`, `icon?` | header pills, StatusPill, "AI-Powered" (deleted), Low/Med/High badges, "projected", "New leader" |
| `LiveDot` | `label?` | 12 hand-made pulsing dots |
| `Delta` | `value`, `base`, `unit?: 'pts' \| 'pct' \| 'places'`, `better?: 'up' \| 'down'`, `quiet?` | `DeltaChip`, ProbBar delta, MedalHero, Spotlight, PodiumStrip `Mover`, expRank delta |
| `Stat` | `label`, `value`, `sub?`, `delta?`, `size?: 'lg' \| 'md' \| 'sm'`, `visual?`, `hint?` | `Tile` in LiveGame, PlayerPage, TeamSpotlight; WhatIf result; SimReplay dl; DisplayEval averages; UnifiedAnalyzer stats |
| `StatStrip` | `items: StatProps[]`, `columns?` hairline cells, no box; 2 columns on phones | grids of Tiles |
| `Panel` | `padding?`, `as?`; slots `Panel.Head`, `Panel.Body`, `Panel.Foot`; `bg-surface`, 1px `line`, `r-md` (on a `surface` group: `bg-raised`) | instrument cards: scenario builders, Elocator input, Spotlight, live board |
| `Rows` / `Row` | `Rows`: ruled list. `Row`: `href?` \| `onClick?`, `lead?`, `title`, `meta?`, `value?`, `figure?`, `selected?`, chevron when interactive | `TournamentCard`, OlympiadCard, GoldPanel, recent results, example FENs, RoundResults rows, ShareList, history lists, top 5, recognition cards |
| `Explainer` | `items: {title, body}[]`, `columns?: 2 \| 3 \| 4`, `note?` | `MethodologyCards`, `WccMethodology` Card, `BoardRaceExplainer`, Candidates "How it works" x2, Elocator steps, Budapest text |
| `Table` family | `Table`, `THead`, `Th` (`sort?`, `onSort`, `align`, `priority`, `width`, `title`), `TBody`, `Tr` (`href?`, `onSelect?`, `selected?`, `tint?`), `Td` (`align`, `priority`, `muted?`); `density?: 'row' 52 \| 'compact' 40`. Relative wrapper, sticky head optional, `aria-sort` | TeamTable, BoardLeaderboard, Spotlight roster, OlympiadSims table, PredictionTable, all `thCls`/`tdCls` fallbacks (11 tables) |
| `TableFallback` | `summary?`, `columns`, `rows` | `wcc/ui TableFallback`, MedalHistory details |
| `Disclosure` | `summary`, `meta?`, `open?`, `variant?: 'plain' \| 'row'` (native details) | 5 raw `details`, completed rounds, Spotlight mobile sections |
| `Tabs` | `items: {label, href, active} \| {key,label,live?}[]`, `value?`, `onChange?`, `ariaLabel`; link tabs or ARIA tabs with arrow keys | header subnav, HeroPanel tablist |
| `Segmented` **C** | `items: {value, label, hint?, icon?, dot?}[]`, `value`, `onChange` \| `href` per item, `role?: 'tablist' \| 'radiogroup' \| 'nav'`, `size`, `full?` | header switcher, metric toggle, builder view, sort toggle, min-games, board picker, `ColourDrawToggle`, LikelyOpponents split |
| `Chip` **C** | `onClick \| href`, `icon?`, `pressed?`, `onClear?`, `tone?: 'neutral' \| 'positive' \| 'negative'` | MoversStrip chips, team filter chip, restore picks, game header chips |
| `PickToggle` **C** | see 8.5 | `wcc PickToggle`, `OutcomeToggle`, `MatchOutcomeToggle`, `GamePicker`, MatchPickerCard draw/team buttons |
| `Field` | `label`, `hint?`, `error?`, `hideLabel?`; wraps one control, wires ids | loose labels |
| `Input`, `Textarea`, `Select`, `SearchInput` | native attributes; 48px, 16px text (no iOS zoom), `bg-raised`, 1px `control`, `focus` ring | 9 inputs, 2 textareas |
| `Checkbox` | `label` | boards `onlyReachable` |
| `Slider` **C** | `label`, `value`, `min`, `max`, `step`, `onChange`, `format`, `tone?`, `marker?`, `disabled?`; filled track to the thumb, ring thumb 24px in a 44px hit area, value at right | WhatIfLab `Slider` |
| `Combobox` **C** | existing API, restyled on `SearchInput` + `raised` list, 44px options | `ui/Combobox`, TeamCombobox look |
| `CopyButton` **C** | `kind: 'link' \| 'text'`, `text?`, `href?`, `label`, `variant?: 'secondary' \| 'quiet' \| 'icon'`; live region, icon swaps to check 1.8s | `CopyLink`, Elocator `CopyButton` |
| `Callout` | `tone?: 'neutral' \| 'brand' \| 'positive' \| 'warning' \| 'negative' \| 'live'`, `action?`, `onDismiss?`; wash ground, no border, 3px left edge in the tone | stale-run, restore, archived, error, projected, played banners; victory banner; ScenarioSummary shell; SpotlightHint; "Predictions updated" |
| `EmptyState` | `title`, `body?`, `action?`, `busy?` | "coming soon", "on their way", "Loading the broadcast", no results, Board races start |
| `Skeleton` | `kind: 'lines' \| 'bars' \| 'histogram' \| 'rounds' \| 'chart' \| 'cells'`, `rows?`, `height?` | `ui/Skeleton`, `ChartSkeleton`, TilesSkeleton |
| `Spinner` | `label` | two inline spinners |
| `Sheet` **C** | `open`, `onClose`, `title`, `side?: 'bottom' \| 'full'`, `footer?`; keeps focus trap, Escape, scroll lock, safe area; marks `data-sheet-open` | `BottomSheet`, mobile nav |
| `ScrollRow` **C** | `label`, `arrows?`, `drag?`, `snap?`, `bleed?` (to the page edge on phones); always `relative`, `data-scroll-row`, `overscroll-x-contain` | 10 `overflow-x-auto` rows, both round-tab scrollers |
| `ScrollArea` | `label`, `maxHeight`, `follow?`; always `relative`; scrolls itself, never the page | move lists, builder match list |
| `Avatar` **C** | `name`, `src?`, `size: 24 \| 32 \| 40 \| 56`, `tone?`, `mono?` (grayscale) | `PlayerAvatar`, GameStrip avatars |
| `AvatarStack` | `people`, `size` | header avatar row |
| `Flag` | `code`, `size: 'xs' 14 \| 'sm' 18 \| 'md' 24 \| 'lg' 32 \| 'xl' 44 \| 'hero' 72`, `title?`, `decorative?`; radius `sm`, 1px ink edge at 12% inside the component | `ui/Flag`, `.tn_XXX` sprite, 30 `!ring-0` overrides |
| `FlagStack` | `items`, `max?` | header flags, OlympiadCard flags |
| `Medal` | `rank: 1 \| 2 \| 3`, `size: 20 \| 28` (number inside, text label for AT) | 6 medal circles |
| `Photo` | `photo: PhotoCredit`, `ratio`, `sizes`, `priority?`, `mono?`, `credit?: 'below' \| 'none'`, `zoom?` | `Image fill` blocks, about photo glow |
| `PhotoCaption`, `PhotoCreditList` | existing API | same |
| `Swatch`, `Legend` | `tone`, `shape?: 'square' \| 'line' \| 'circle' \| 'triangle' \| 'diamond'`; `Legend items` | `wcc Swatch`, all hand-made dots and legends |
| `Meter` | `value`, `baseline?`, `max?`, `tone?`, `label?: 'right' \| 'none'`, `ruled?`; hides fill and track at 0 | `ProbBar`, GoldPanel bar, TournamentCard bar |
| `SplitBar` | `segments: {key, value, tone, label}[]`, `height?: 8 \| 12 \| 20 \| 32`, `labels?: 'none' \| 'inside' \| 'ends'`, `ariaLabel`, `tick?` | WinSplitBar bar, TriBar, market bars, MedalHero bar, W/D/L bars (Spotlight, MatchPicker, LikelyOpponents), H2H bar, home split |
| `Pips` | `kind: 'result' \| 'form' \| 'games' \| 'eligibility'`, `items`, `size?: 12 \| 20 \| 32`; letter inside from 20px | `FormPips`, `EligibilityPips`, HeadToHead pips, H2HBar, SimReplay `Pip` |
| `Podium` | `places: {rank, name, flag, stats, note?, pre?}[]`, `layout?: 'stack' \| 'row'`; a 3px medal-coloured rule over each place, first place larger | `FinalPodium`, `PodiumStrip` cards |
| `Quote` | `text`, `logo`, `cite` | home press cards |
| `LogoRow` | `label`, `logos` (class `press`) | "As seen in" |
| `RelativeTime`, `LocalTime`, `Countdown` **C** | `iso`, `format`; `Countdown variant: 'full' \| 'inline'` | `RelativeTime`, `localTime/localDay`, `Countdown`, `CompactCountdown` |
| `Crown` | via `Icon name="crown"` in `brand-mark` | `wcc Crown` |

### 8.3 Charts: `components/charts`

| Component | Props | Replaces |
|---|---|---|
| `ChartFrame` **C** | `caption?`, `ariaLabel`, `height: {desktop, phone}`, `legend?`, `table`, `children: (size) => ReactNode`, `empty?` | chart wrappers |
| `LineChart` **C** | 8.5 | `WinProbHistoryChart`, `MedalHistoryChart`, `TprTrend`, `LiveCharts`, `DisplayEval` (recharts), `currentPredictions` Line, `MedalChart` Line, `WCCSims` (chart.js) |
| `Sparkline` | `values`, `tone` | Spotlight Sparkline |
| `ColumnChart` **C** | `columns: {key, label, sub?, parts: {tone, value, label}[]}[]`, `format`, `peak?: true`, `height`, `onHover?` | `ClinchTimeline`, Spotlight finish histogram, Elocator per-move bars |
| `ButterflyChart` | `rows: {key, label, sub, left, right, divider?}[]`, `leftTone`, `rightTone`, `format` | `ScoreDistribution` |
| `LadderChart` | `rungs: {label, sub, rule, reach, segments}[]` | `HowItEnds` |
| `RaceRows` **C** | `rows: {rank, flag, name, seed?, segments, value, sub?, baseline?, delta?, selected?, onSelect, onPrefetch}[]`, `ruled` header | `MedalHero` |
| `BarRows` | `rows: {label, value, tone, lead?}[]`, `format` | `currentPredictions` Bar, MedalChart Bar |
| `PawnBar` **C** | `p1`, `names`, `deal?: boolean`, `rows?: auto (1 desktop, 4 phone)` | WinSplitBar on heroes |
| `ChartTooltip`, `Crosshair`, `Axis`, `EndLabels` | internal | 4 tooltips |
| `useSize`, `useChartTheme`, `labelSolver.ts`, `scales.ts` | helpers | 5 copies of ResizeObserver code, `useChartTheme`, `useChartColors` |

### 8.4 Chess: `components/chess`

| Component | Props | Replaces |
|---|---|---|
| `Board` | `fen`, `from?`, `to?`, `flipped?`, `label`, `coords?` (SVG, sage squares, gold last move) | `BoardSvg`, `elocator/ChessBoard` (fixed 56px squares overflow phones) |
| `BoardControls` **C** | `ply`, `last`, `onGo`, `onFlip?`, `live?` `{behind, onLive}` | three sets of arrow buttons |
| `MoveList` **C** | `moves: {san, meta?}[]`, `ply`, `onGo`, `maxHeight` | LiveGame and GameViewer lists (28px rows become 36px, 44 on touch) |
| `GameViewer` **C** | existing props | `chess/GameViewer` (rebuilt on the above; `scrollIntoView` replaced by list-only scrolling) |
| `EvalBar` | `evaluation`, `stale`, `flipped`; 28px wide, 13px label | `live/EvalBar` |
| `PlayerClock` | `name`, `rating?`, `clock?`, `running?`, `tone` | LiveGame `PlayerRow`, SideLabel |
| `PieceDot` | `side: 'white' \| 'black'`; always next to the words "White: Gukesh" | `Piece`, `PieceIcon`, colour-draw dots |
| `ComplexityScale` | `score`, `size?: 'lg' \| 'sm'`; four teal segments, marker, word, "94 / 100" | `ComplexityBar` |
| `FaceOff` **C** | 8.5 | `FaceOffHero` portraits, `WccHomeFeature`, `WinSplitBar` |
| `OddsChip` | `sides: [{name, p, tone}, {...}]`, `preview?` | mobile bar odds |
| `GameSheet` / `GameCell` **C** | 8.5 | `GameStrip`, `GameCard` |
| `MatchCalendar` **C** | `days`, `games`, `players`, `hrefFor(gameNo)` | `ScheduleCalendar` grid |
| `MatchRow` **C** | `home`, `away` (flag or avatar, name, meta), `result?`, `pick?`, `probs?`, `status?`, `onPick?`, `onSelect?` | `MatchPickerCard`, `GamePickerCard`, RoundResults row, CompletedRoundList row |
| `ScenarioPanel` **C** | `title`, `rounds: {key, label, state, dot?}[]`, `round`, `onRound`, `tools?`, `summary?`, `primary`, `onReset?`, `children`; a `Panel` with round `ScrollRow`, scroll area and footer | chrome of both scenario builders, `GameHouse`, `GameHouseGeneral` |

### 8.5 Key signatures (build exactly these)

```ts
// components/ui/PickToggle.tsx
type PickOption<V extends string> = { value: V; label: string /* full words for AT */; face?: { src: string; name: string }; glyph?: string /* "½", "1", "0", "=" */; pct?: number; tone: Tone; preview?: string };
interface PickToggleProps<V extends string> { legend: string; options: PickOption<V>[]; value: V | null; onChange(v: V | null): void; onPreview?(v: V | null): void; size?: 'lg' | 'sm'; disabled?: boolean }
```
Grid of equal cells, 4px gaps, each a `button aria-pressed`. `lg` 60px tall: face 26px or glyph over the percentage (`type-label` 500 tabular). `sm` 44px: glyph only. Rest: `bg-raised`, 1px `control`. Hover: `bg-sunken`. Picked: solid `fillClass[tone]` + `onClass[tone]`, 2px ring in `ink` offset 1 when focused. Press again to clear. `aria-label` = `${legend}: ${label}, ${pct}. ${preview}`. Names are always reachable: on `lg` at 768+ the short name shows as `title`, and the AT label has it in full.

```ts
// components/chess/FaceOff.tsx
interface FaceOffSide { id: 1 | 2; name: string; role: string; isChampion: boolean; rating: number | null; flag: string; portrait: { src: string; alt: string; cutout: boolean } }
interface FaceOffProps {
  variant: 'hero' | 'feature';           // hero: full size; feature: home and index, same parts, portraits 220px
  sides: [FaceOffSide, FaceOffSide];
  p1: number | null;                     // null before odds exist
  base?: number | null;                  // shows Delta over each figure when a scenario moves it; pass it (or null) to keep the room
  score: ReactNode; scoreLabel: string;  // "½–½", "after game 1"; countdown before the match
  verdict?: ReactNode;                   // standfirst
  notes?: [ReactNode, ReactNode];        // line under the pawn bar
  actions?: ReactNode;                   // Watch live + second button
  next?: ReactNode;                      // "Game 2, Wed 25 Nov at 15:00 CET"
  credit?: ReactNode;
  champion?: { name: string; line: string } | null; // finished state
}
```
Desktop grid 268 / 1fr / 268 (hero), 32px gap, all on the 2px rule. Portrait box 1:1.1; the field block fills from 13% down; the black-and-white cut-out (class `grayscale` on the img as well) breaks out of its top edge. `cutout: false` puts a square grayscale photo inside the same block with a 3px field edge, so any player works. Middle: names row (name `type-h2`, crown, role and rating in `type-small`), then the two `type-figure` percentages with at least 48px between them, the % sign at .44em in `ink-3`. Under the rule: `PawnBar deal`, notes line, then verdict (7 cols) and next game + actions (5 cols). Phone order: two portraits side by side with names over the rule, figures (50px, must fit "100.0%" and "0.0%" at 320), pawn bar 4x25, verdict, actions full width. **It is not a link**; its buttons are.

```ts
// components/chess/GameSheet.tsx
interface GameCellView { gameNo: number; dateLabel: string; whiteName: string | null; whiteAssumed: boolean; odds: Triplet; pPlayed: number; result: HalfPoints | null; live: boolean; next: boolean; unreachable: boolean; pick?: PickOutcome; swing: Record<PickOutcome, number> | null; href: string /* /world-chess-championship-2026/live?game=N */ }
interface GameSheetProps { games: GameCellView[]; players: Players; locked: boolean; onPick(g: number, v: PickOutcome | null): void; onPreview?(p: number | null): void }
```
Desktop: 7 x 2 ruled grid (`control` lines top and bottom of each row, `line` between columns), first column flush left. Cell: game number `type-h3` **as a link** to `href` ("Game 2", `aria-label="Game 2, watch or replay"`, play icon 14px, underline on hover) and date `type-label` right; `PieceDot` + "White: Gukesh"; `PickToggle lg` (Gukesh / ½ / Sindarov with percentages); note "Played in 88%" from game 8. Played game: result in `type-h3` ("Draw ½–½", "Gukesh won") with a 3px top edge in the winner's tone and "Final. Replay" link. Live game: `LiveDot` + "Live now" link, 2px `live` edge. Next game: 2px `ink` outline. Unreachable: `ink-3`, disabled, "Not played: match already decided". Phone: one full-width row per game: left column number link, date, White; right three 64x60 pick cells; games 8 to 14 behind "Show games 8 to 14" unless one is picked, live or next. No swipe strip.

```ts
// components/charts/LineChart.tsx
interface LineSeries { id: string; label: string; short?: string; values: (number | null)[]; tone: Tone; emphasis?: 'strong' | 'normal' | 'context'; dash?: boolean; labelAt?: 'end' | 'start' | number }
interface LineChartProps {
  series: LineSeries[]; x: { labels: string[]; every?: { desktop: number; phone: number } };
  y: { min?: number; max?: number; ticks?: number[]; format(v: number): string };
  height?: { desktop: number; phone: number };          // default 420 / 300
  markers?: { x: number; y: number; shape: 'circle' | 'square' | 'triangle'; label: string; group: string }[];
  refs?: { y: number; label: string }[]; now?: number;   // dashed line: last known x
  area?: { series: string; mode: 'below' | 'zero' };     // 15% fill
  points?: 'none' | 'all';                               // TPR trend: all, with values printed
  selected?: number; onSelect?(i: number): void; onSeries?(id: string): void;
  caption?: string; ariaLabel: string; table: { columns: string[]; rows: (string | number)[][] };
}
```

```ts
// components/layout/SectionBar.tsx
interface SectionBarProps { groups: { label: string; items: { id: string; label: string; also?: string[] /* other section ids that mark it current */ }[] }[]; heroId: string; live?: ReactNode; eventLabel: string; actions?: ReactNode }
```

### 8.6 What gets deleted

Unused today: `GameHouse`, `LoadingChessAI`, `PredictionTable`, `elocator/AnalyzeGame`, `elocator/ChessBoardManager`, `OlympiadGoldSummary`, `OlympiadBoardLeaders`, `app/elocator/_layout.tsx`. Replaced: `Button.tsx`, `ChartSkeleton`, `navbar`, `Footer`, `TournamentCard`, `TournamentHeader`, `PlayerAvatar`, `OutcomeToggle`, `GamePickerCard`, `GamePicker`, `GameHouseGeneral`, `MedalChart`, `elocator/ChessBoard`, `ComplexityBar`, `DisplayEval`, `MatchOutcomeToggle`, `MatchPickerCard`, `BottomSheet`, `CopyLink`, `ProbBar` (formatters move to `lib/format.ts`: `formatPct`, `formatDelta`, `fmtUsd`, `inHundred`), `wcc/ui.tsx` (types move to `lib/wcc/display.ts`), `wcc/motion.ts` (to `hooks/`), Feature folders (`components/wcc`, `olympiad`, `simulation`, `live`, `elocator`) keep only components that load or derive data and compose the library.

### 8.7 Where things are, and what the foundation added

Named exports, one file per component, path = folder + component name (`@/components/ui/PickToggle`). No barrel files. Several in one file: `Rows`/`Row` (`Rows.tsx`), `Table`/`THead`/`Th`/`TBody`/`Tr`/`Td` (`Table.tsx`), `Input`/`Textarea`/`Select`/`SearchInput` (`Input.tsx`), `PhotoCaption`/`PhotoCreditLine`/`PhotoCreditList` (`PhotoCredit.tsx`), `Swatch`/`Legend` (`Swatch.tsx`), `LogoRow`/`Logo` (`LogoRow.tsx`), `GameSheet`/`GameCell` (`GameSheet.tsx`), `useTheme`/`ThemeProvider`/`ThemeToggle` (`layout/ThemeProvider.tsx`). `Panel.Head`, `Panel.Body`, `Panel.Foot` hang off `Panel`. The header, menu and footer links are `layout/nav.ts`. The logo is `layout/Logo.tsx` (`kind: 'full' | 'pawn'`).

Additions to the props in 8.1 to 8.5 (nothing was removed):

| Component | Added | Why |
|---|---|---|
| `Section` | `title` optional with `label`; `ratio` includes `'1/1'` | the Elocator tool section is already named by the page title |
| `Segmented`, `Tabs` | `ariaLabel` (required) | a group needs a name |
| `Tabs` | `panelPrefix` | wires `aria-controls` to panels |
| `Stat` | `className`; `StatStrip items[].key`, `columns` 2 to 6 | |
| `IconButton` | `icon` may be an element; button attributes | theme toggle shows one of two icons by CSS, so it is right before hydration |
| `Chip` | `icon` may be an element | flags in chips |
| `LiveDot` | `inherit` | the dot inside a filled button |
| `Sheet` | `tools`; it sets the side edges of title, body and footer, its content sets the space above and below; the first button of `footer` fills the line on phones | controls beside Close; one left edge |
| `Avatar` | `initials`, `decorative` | |
| `Flag` | `decorative`; `aria-hidden` is a deprecated alias | |
| `SearchInput`, `Textarea` | native attributes; `Textarea mono` | |
| `Table` | `label`, `stickyHead`, `scroll` (TableFallback only); `Td header`; `Tr id` | |
| `ScrollArea` | `follow` is a CSS selector, `followKey` says when to look again; `passive` is not a region and not a tab stop | scrolls itself, never the page; `passive` for the `Combobox` list, where focus stays in the input |
| `Callout` | `icon`, `role` | |
| `LineChart` and the other charts | `format` is `Formatter`: a function or a name from `lib/format` (`pct`, `pct0`, `percent`, `percent0`, `int`, `one`, `signed`) | a server component cannot pass a function to a client chart |
| `ColumnChart` | `values`, `onSelect`, `selected`, `caption`, `ariaLabel`, `table` | the 83-column Elocator chart prints no values |
| `ButterflyChart` | `names`, `ariaLabel` | |
| `MatchRow` | `options`, `legend`, `disabled`; sides are `{lead, name, meta, onSelect?, emphasis?, muted?}` (`muted`: the loser) | `onPick` needs the pick cells |
| `ScenarioPanel` | `primary` is a node or `{label, onClick, disabled?, loading?}`; `collapsible` (under 1024) | |
| `Button`, `IconButton` | link attributes pass through with `href`; `loading` keeps focus (`aria-busy`, presses ignored) | a disabled button drops keyboard focus |
| `TextLink` | `standalone`: 44px tall, for a link on a line of its own | |
| `Delta` | `unit="plain"` with `format` (rating points, dollars), `short` (unit word for AT only), `label`; with `unit="places" better="down"` the arrow says which way the entry moved | |
| `Row` | `size: 'md' \| 'sm'`, `expanded` + `children` (the row opens what is under it), `onPrefetch`, `aria-label` | player games, top 5 |
| `Tr` | `label` (makes an `onSelect` row reachable by keyboard), `onPrefetch` | |
| `Td header` | `lead` (flag, avatar), `meta` (seed); it takes the space that is left and truncates, a direct child link fills the row height. Column width from 768 is a third (half in compact); set another with `className="md:w-1/2"` | section 5.5 |
| `Segmented` | `items[].ariaLabel` | "1" needs words |
| `Chip` | `clearLabel`, `disabled`; without `onClick` or `href` it is not a control | |
| `SearchInput` | `onClear` (adds the clear button while there is text) | |
| `Combobox` | `empty`, `id`, so it works inside `Field` | |
| `Slider` | `hint` under the track | says what the marker is |
| `EmptyState` | `level: 2 \| 3` | |
| `Skeleton` | `label`; `Spinner` `size` | |
| `ScrollRow` | `follow`, `followKey` (centres that element, scrolling only the row); arrows sit together at the right end; `stretch`: children touch, are equally tall and share the width from 1024 | round tabs; `PodiumStrip` |
| `AvatarStack`, `FlagStack` | `label`; `FlagStack decorative`; `Medal decorative` | |
| `Meter` | `format`; `max` scales the bar only, the label is still `value` | as `ProbBar` did |
| `Pips` | `items[].caption` at size 32; linked pips are 44px tall | simulated match |
| `PhotoCreditLine` | `photos`, `changes?`: one line for several photos, with what was altered | every `FaceOff` credit: "Photos: A, licence; B, licence. Backgrounds removed, black and white." |
| `PodiumStrip` (`ui/PodiumStrip`) | `label`, `columns: {key, label, meta?, places}[]`, `selected`, `onSelect` | the board-prize strip in 11.8; `Podium layout="row"` stays three ruled columns |
| `Photo` | `photo` is a `PhotoSource`: a credited `PhotoCredit`, or `{src, alt, focal?}` for the site's own picture, which has no caption | about photo |
| `Prose` | `columns: 1 \| 2` | "Why the gap?" |
| `PickToggle` | `onPreview` fires on mouse hover and keyboard focus and ends on press | a tap would leave it on |
| `SplitBar` | an inside label that does not fit its segment is left out, and stands to the right of a `tick` it would cross | phones |
| `Segmented` | labels are never broken: cells that do not fit go to a second line and fill it; icons go under 360px | 320px |
| `LogoItem` | `width` and `height` as drawn, in the ratio of the file | no shift, no warning |
| `OddsChip` | `variant: 'inline' \| 'halves'` | the bottom bar is two solid halves |
| `FaceOff` | `preview`: side one's odds a pointed-at pick would give, in the place of the delta | section 7, Preview |
| `PlayerClock` | `side: 'white' \| 'black'` shows the piece instead of the tone | games of players with no colour |
| `LineChart` | `x.titles` (longer words for the tooltip), `values` (the last value after each end label), `series[].labelAt: 'none'`, `series[].notes` (second line under a printed value), `seriesAction` (what a series button does, after its name), `extraRows(i)` (tooltip rows), `ground` (`raised` in a Sheet; a Panel or a surface group is found by itself) | |
| `ChartGroup` (`charts/ChartGroup`) | children: charts with the same `x.labels` share one crosshair and line up | complexity and evaluation on the live page |
| `ColumnChart` | drawn in `ChartFrame`: gaps, labels and printed values follow its own width, so it works in a narrow column | section 11.7 |
| `RaceRows` | `muted`; a `value` of "0.0%" is quiet by itself. Under 768 the delta joins the second line | |
| `MatchRow` | in a narrow box the flag goes over the name; names wrap, they are not cut | 320px |
| `BarRows` | `max` (value of a full bar), `rows[].key`, `ariaLabel` | |

Probabilities are 0 to 1 everywhere (`p1`, `SplitBar` values, `Meter` with its default `max`, `PickOption.pct`, `OddsChip`). `LineChart` takes whatever the caller formats.

Hooks: `usePrefersReducedMotion`, `useTween`, `useNow` and `useMounted` (both in `useNow.ts`), `useHeroGone`, `useActiveSection`, `useMediaQuery`, `useUrlParam`.

CSS classes outside Tailwind are four, in `app/globals.css`: `lift` (button hover and press), `nudge` (arrow inside a lifted button), `zoom-frame` (photo inside a link), and the base layer. Inside a `HeroEnter`, a part opts into the entrance with `group-data-[enter]/enter:animate-*`. On a `surface` group, `group-data-[ground=surface]/ground:` is how a component changes its ground.

`/styleguide` (`app/styleguide/page.tsx`, `components/styleguide/*`) renders every component in this section inside the site shell; noindex, out of the sitemap, disallowed in robots. A new component or variant goes there in the same commit. Its numbers are a fixed snapshot (`fixtures.ts`).

From 1024 to 1439 `SectionBar` shows the buttons in `actions` as icons (the words stay for assistive tech), so give each an icon. It shows as many links as fit on one line (at most 8); the rest, and every section, are in "More", which names the current section when its link is not on the bar. `Breadcrumb` has `compact` (phones leave out the current page), which `PageHead` sets when there is a `switcher`. The site menu lists the main links and this year's tournaments (`TOURNAMENT_LINKS` in `layout/nav.ts`). `Section` marks `data-pace`; a surface `SectionGroup` pads to match.

`SiteFooter`, not `Page`, pads for the bottom bar, because it is the last thing on the page. Scroll lock for sheets is on `html`, because `overflow-x: clip` on `html` stops `body`'s overflow from reaching the viewport.

`components/ui/styles.ts` holds the class strings primitives share (hover and selected ground, gold hairline, control edge, row bleed); only the library (`ui`, `layout`, `charts`, `chess`) imports it. The gold hairline is written there once: `linkLine`, `proseLinks`, `cellLink`, and `goldLine` for a title that gets its line on hover. `Panel`, `Sheet` and the Combobox list set `data-panel` on `group/panel`, which is how a row inside them picks a tint that shows. Hover and selected grounds of rows run 12px past their rules on both sides.

`app/legacy.css` and `components/ThemeProvider.tsx` exist only for pages not migrated yet. Delete them with the last one.

---

## 9. Rules against drift

`npm run lint` = `eslint . && node scripts/check-drift.mjs && node scripts/check-theme.mjs app/tokens.css`. `npm run build` = `npm run lint && next build` (keep `postbuild`). `npm run theme` = gen-tokens + check-theme. `check-drift.mjs` is supplied; on today's code it reports 3,523 findings in 179 files; the target is 0.

| Rule | Rejected | Allowed only in |
|---|---|---|
| raw-colour | `#rgb`, `#rrggbb(aa)`, `rgb() rgba() hsl() hsla() oklch() color-mix()` | `app/tokens.css`, `lib/theme/**` |
| default-palette | `bg-red-500`, `text-white`, `border-black`, any Tailwind hue | nowhere |
| arbitrary-colour | `bg-[#..]`, `text-[var(--x)]`, `ring-[rgb(..)]` | nowhere |
| arbitrary-type | `text-[13px]`, `leading-[..]`, `tracking-[..]`, `font-[..]`, `text-sm` to `text-9xl` | nowhere |
| tracked-caps | `uppercase`, `tracking-wide*`, `textTransform` | nowhere |
| raw-element | `<button> <table> <thead> <tbody> <input> <select> <textarea> <details> <summary> <dialog>` | `components/{ui,layout,charts,chess}` |
| raw-svg | `<svg>` | same |
| ad-hoc-card | `surface-card`, `rounded-*` + `border` on one element | same |
| own-width | `max-w-xl` to `7xl`, `max-w-[..px]` | same |
| own-scroller | `overflow-(x-\|y-)auto\|scroll` | same (and those set `relative`) |
| gradient-glow | gradients, `blur-2xl`, `backdrop-blur` | nowhere |
| chart-lib | `chart.js`, `react-chartjs-2`, `recharts`, datalabels | `components/charts/adapters.ts` |
| old-token | `--bg-*`, `--text-*`, `--wcc-*`, `chess-gold`, `gold-ink`, `medal-gold` | nowhere |
| emoji-glyph | emoji and media glyphs | nowhere |
| inline-colour | `style={{ color, background, borderColor, fill, boxShadow }}` | library folders, OG files |

A line may carry `drift-ok: reason` (Polymarket iframe attributes are the only expected case). ESLint adds `no-restricted-imports` for `react-icons/*` outside `components/ui/Icon.tsx`, `next/image` outside `ui/Avatar`, `ui/Photo`, `ui/LogoRow`, `chess/FaceOff`, `layout/*`, and `next/font/*` outside `app/fonts.ts`. Review rule: a page or feature file that needs a class combination twice adds a prop to the library instead.

---

## 10. Copy

Plain and specific. Headings name a thing or state the finding; buttons are a verb and an object, at most two in a hero. No eyebrows, colon headings, "VS", "AI-Powered", "unveiling", "groundbreaking", em-dash asides or exclamation marks in interface copy. Arrows are icons, not characters. Numbers keep their unit. Use "Tap or click" or neutral wording; never "Hover". Labels say "White: Gukesh", not a bare dot. Findings must be computed from data or limited to finished events; nothing is invented. Vocabulary: match odds, game, round, simulation, scenario, pick, tiebreak, complexity (always 1 to 100; the Elocator page's "1 to 10" is wrong against its own API and is corrected).

---

## 11. Pages

All URLs, query parameters, hashes, metadata, JSON-LD, revalidation, polling, keyboard shortcuts and aria text stay as they are unless a line below says otherwise.

### 11.1 Home `/` (landing)

1. **Hero** (`min-h-hero`, alone on the first screen at 1440x900). `PageHead size="mega" enter`: h1 "Forecasts for championship chess"; lead right of it, bottom-aligned: "Exact match odds, tournament simulations you can steer, and a complexity score for any position." Then a 1px `line`, then `FaceOff variant="feature"` fed by the existing `WccHomeFeature` loader (renamed `components/wcc/WccFeature.tsx`): row above the portraits with "World Chess Championship 2026, Geneva" (`type-h3`) left and next game right; score or `Countdown inline`; `PawnBar deal`; note "Exact odds, confirmed by 10,000 simulations" (or the pre-run text). **Actions: `Watch live` (to `/world-chess-championship-2026/live`) and `See the match odds`.** While a game is live, `Watch live` is primary with `live` dot and reads "Watch game 2 live"; otherwise `See the match odds` is primary and `Watch live` secondary. After the match: "See how it ended" and "Replay the games". Credit line under the figure (`PhotoCreditLine` with "Backgrounds removed, black and white"). No dead band above the portraits: 24px.
2. **Recent results** (`Section rail pace="landing"`). Finding: "The chance our model gave each winner before round 1." `Rows`, four: Uzbekistan (Chess Olympiad 2026), China (Women's Olympiad), Javokhir Sindarov (2026 Candidates), Vaishali Rameshbabu (2026 Women's Candidates). Lead = `Flag` (no avatars: several have no recorded licence). Meta keeps today's description and format text; value = pre-event chance from `getOlympiadSummaryHistory` (roundsCompleted 0) or the `Pre` row of `getBaseSimulationData`, as `type-stat-sm` + `Meter ruled`. If a number is missing, drop the figure, keep the row. While an Olympiad is live, its row shows the live leader, as `OlympiadCards` does today. Action: `See every simulation`.
3. **2026 Candidates** (`Section rail`). `LineChart` of the Candidates history: winner `strong` in its series tone, the others `context`, labels for any player who peaked above 10%. Finding computed: "Javokhir Sindarov won from a starting chance of 8.2%." plus "He was behind Fabiano Caruana until round 5." built from the first round after which the winner led for good. Link: `Replay the Candidates`. Chance to win, so y 0 to 100%.
4. **Elocator** (`SectionGroup surface`, `Section split ratio="5/7"`). h2 "Elocator scores how hard a position is"; body "Paste a FEN or PGN. A neural network trained on more than 100,000 grandmaster moves rates the position from 1 to 100 for the player to move."; button `Analyze a position`. Right: `Board` after 17. Kf1 from Byrne vs Fischer, 1956 (`lib/elocator/game-of-the-century.json`, real API scores), beside it "94" in `type-mega` size (as a figure, not a heading), "Extreme, out of 100", `ComplexityScale lg`; under both a `ColumnChart` of all 83 positions in `complexityTone`, move 17 labelled.
5. **In the press** (`Section rail`): `Quote` with the NYT text and cite; NPR `Row`; `LogoRow label="Also seen in"` Japan Times, Gulf News, Deccan Herald. Text unchanged.

### 11.2 Simulations index `/simulations` (landing)

`PageHead` h1 "Simulations", lead unchanged. Section "World Chess Championship 2026": `FaceOff variant="feature"` with the same two actions. Section "Past tournaments" (`rail`): `Rows` grouped by year with `h3` "2026" and "2024"; each row: flags or flag of the winner, name, description, format as meta, winner with `Medal rank=1`; the Olympiad rows keep their medalist `FlagStack` and "+N". All eight links kept. No cards.

### 11.3 Elocator `/elocator` (landing, tool)

Split `page.tsx` into a server page (adds metadata title "Elocator: Chess Complexity Calculator | Pawnalyze") and the client analyzer. 1) `PageHead` h1 "Elocator: Chess Complexity Calculator" (no "AI-Powered" tag), lead unchanged, with the `ComplexityScale` words as a fact. 2) Tool, first screen: `Section plain`, `Panel` as `Split`: left `Field` "FEN or PGN" + `Textarea` (mono), `Button primary` `Analyze` (loading "Analyzing"), `Callout negative` for errors; under it three `Chip`s "Try: start position / middlegame / sharp position" that fill the box with the three example FENs (new convenience, same data). Right: `Board` (fluid, max 520px) with `BoardControls`. FEN result: score in `type-h1` + "/ 100", `ComplexityScale lg`, FEN in `type-mono` with `CopyButton`. The result slot accepts the API's error string as a `Callout`, never as a number. PGN result: game header as facts line, `Stat` complexity and position, `LineChart` with White and Black as two series (`ink` and `context`, direct labels, `selected` = current position, click to jump), two `Stat` averages; `TableFallback`. 3) "How it works" `Explainer columns=4`, text kept; step 3 corrected to "1 to 100 scale: positions are scored from 1 (simple) to 100 (extreme)"; step 4 "move-by-move complexity charts" (the evaluation graph no longer exists). 4) "Example positions": `Rows` with a 96px `Board`, word from its label, FEN mono truncated, `CopyButton`. 5) "Example game": title, players, moves in `type-mono` `ScrollArea`, `CopyButton`.

`/elocator/broadcast`: `Page` + `PageHead` h1 "Elocator broadcast" + `EmptyState` with the existing "Info" slot; keeps mounting `BroadcastRoundComponent`.

### 11.4 About `/about` (landing)

`PageHead` h1 "About Pawnalyze". `Section split ratio="5/7"`: left `Photo` (square, no glow, zoom none), right `Prose`. Owner's text stays in the first person with these edits only: "a haven for chess enthusiasts and data lovers alike" → "a site for people who like chess and data"; "with a penchant for chess, albeit not mastering it just yet" → "who plays chess, not very well yet"; heading "Elocator: Unveiling Chess Complexity" → "Elocator"; "a groundbreaking project named Elocator" → "Elocator"; "Join The Journey" → "Follow along"; drop "I am thrilled to share it with you". Sections: Elocator, Recognition (`Rows`: The New York Times, NPR, text unchanged), Follow along with `Follow on X` and `View on GitHub` (`secondary`). Links unchanged.

### 11.5 World Championship 2026 `/world-chess-championship-2026` (dashboard)

`SectionBar` groups: **Forecast** Odds `#odds`, Scenarios `#scenario`, Endings `#when` (also `#scores`, `#how-it-ends`); **Play** Replay `#replay`, What-if `#what-if`; **Context** Markets `#markets` (also `#history`), Form `#head-to-head` (also `#prize`), Schedule `#schedule`, Method `#methodology` (also `#photo-credits`). Live slot `OddsChip`; actions Reset (when a scenario is active) and `CopyButton "Share scenario"`.

Forecast (canvas):
1. `PageHead size="mega"`: crumbs Simulations / World Championship 2026; h1 "Gukesh vs Sindarov"; facts: "FIDE World Championship 2026", "22 Nov to 13 Dec, Fondation Martin Bodmer, Cologny, Geneva", "14 classical games, first to 7½, $2.5M prize fund".
2. `#odds` `FaceOff variant="hero"`. Score slot = `MatchStatus` logic (countdown, score after game N, live, level at 7–7, awaiting results). Verdict (standfirst): scenario label if any, "Sindarov wins about 85 in 100 matches. 13.6% go to tiebreaks.", then in `ink-3` the market contrast "Kalshi traders give Gukesh 27.4%." when a stored Kalshi quote exists. Notes: "Chance to win the match. Each pawn is 1 in 100." and the existing exact/simulations/freshness sentences. **Actions: `Watch live` primary always on this page** ("Watch game 2 live" with dot while live), second `Pick results` to `#scenario`; next game line above them in local time with "rest day" logic. Champion state: `champion` block with crown, name, "Won 7½–5½ after game 13.", frozen-odds sentence. Credits under the figure.
3. `StatStrip` six: Classical, Rapid, Blitz (Gukesh / Sindarov), Goes to tiebreaks, Last game, Draw rate.
4. `SectionBar`, then restore note `Callout` (aria-live).
5. `#scenario` `Section wide` "Pick the results" (finished: "Game by game"). Description: "Choose a result for any game and every number on this page updates at once." Actions: `ColourDrawToggle` as `Segmented` while the colours are unknown, Reset, Share. `GameSheet`. Legend: `PieceDot` who has White (assumed note), "Percentages are Gukesh win, draw, Sindarov win for that game". Each game links to `/live?game=N`.
6. **How the match ends** (one heading family): `#when` `Section wide`, h2 computed "Game 13 is the likeliest finish" (or "Tiebreaks are the likeliest finish"), finding as today, `ColumnChart` full width, p1 under p2, peak large, "Games 1 to 7 cannot decide the match" note. Then `Section split`: `#scores` `ButterflyChart` (h2 from the most likely score) and `#how-it-ends` `LadderChart` (stages, rules, reach, hatch for still level). Tables kept.

Play (surface group):
7. `#replay` "Deal a simulated match": rail; button `Deal a match` / `Deal another`; running score in `type-h1`, result line, 14 + tiebreak `Pips kind="result" size=32`, four `Stat`s, "Skip to the end".
8. `#what-if` "What-if lab", tag-free description "Exploratory, not a forecast. ...". `Panel`: three `Slider`s (p1, p2, ink; marker at fitted θ), notes and grid states; right column `Stat` win chance with `Delta`, break-even sentence; `Reset lab`.

Context (canvas):
9. `#history` `LineChart`: Gukesh `strong` p1, markers for Kalshi circle, Polymarket square, bet365 triangle with leader-spaced end labels, dashed market lines, y 0 to 50% while the maximum is under 45% else 0 to 100%, x Pre, G1 to G14, TB with `now`. Hidden until two runs, as today.
10. `#markets` "What the money says": aligned rows, each = source (link, note), Gukesh % `type-stat-sm`, `SplitBar height=20`, Sindarov %; Pawnalyze row first on `brand-wash` with a `brand-mark` edge; Kalshi, Polymarket (bid/ask, traded, updated `RelativeTime`), bet365 reference. At 1024+ bid/ask, traded and updated sit in their own columns. Suspense `Skeleton kind="bars"`. "Why the gap?" as two-column `Prose`. `PolymarketEmbed` x2 and its disclaimer kept; third-party widgets stay lazy.
11. `#prize` + `#head-to-head` `Section split`: prize (two `Stat`s with p1/p2 swatches, rule and exception text, `Delta` in a scenario); "Head to head" (per time control: `Pips kind="result" size=20`, counts, note) and Olympiad form (`Pips kind="form"` with letters, score, opponent average, link).
12. `#schedule` `Section rail`: finding = start time in CET and local; `Photo` venue 3:2 with `PhotoCaption` below. `MatchCalendar`: 7-column month grid on every width (phone: 52px cells, number + short label), Monday first. Game cells **link to `/live?game=N`**; played shows ½ or the winner's initial with its tone as a 3px top edge, live shows dot, next game has a 2px `ink` outline, ceremony and tiebreak days carry their label in `brand` (no tinted ground), rest days plain. Regulations link.
13. `#methodology` `Explainer columns=2` with all four texts, rules link, model/run line; `#photo-credits` `PhotoCreditList` in a `Disclosure` open by default.

Empty state (no run): hero without figures, `EmptyState` "Match odds are on their way", then form, schedule, method. `BottomBar`: `OddsChip` as two halves, Reset, Share.

### 11.6 Live game `/world-chess-championship-2026/live` (dashboard)

`PageHead` h1 "Gukesh vs Sindarov, live"; lead unchanged; action `See the match odds`. Under it the game picker: `ScrollRow` of 14 link-style `Segmented` cells (44px): "1" to "14" with result glyph (½, or the winner's initial) when finished, `LiveDot` when ongoing, muted when not started, `aria-current`, date in `title`; keeps `?game=` and `?round=` behaviour. Then `Section plain` with `Split asideWidth="wide"`: left `PlayerClock`, `EvalBar` + `Board` (max 560), `PlayerClock`, `BoardControls` with `Back to live`; right: heading "Game 2: Gukesh – Sindarov", status `Tag` (live, connecting, reconnecting, unreachable, final, starts in), opening, `StatStrip` of two (Stockfish with note and stale state; Complexity with `ComplexityScale sm`), `MoveList follow`. Phone order: title line + tag, clocks and board, controls, stats two-up, moves (max 220px), charts. Section "Complexity and evaluation" (`wide`): two `LineChart`s on one shared x and crosshair (`ChartFrame` group): complexity 0 to 100 with p1/p2 lines and averages in the end labels; evaluation in `ink` with zero line and 15% area; click selects the ply; table. Sources line kept. Loading and unreachable = `EmptyState busy`. Keyboard arrows, Home, End, f kept. A "Match odds and predictions" link stays.

### 11.7 Olympiad 2026 open and women `/simulations/(womens-)chess-olympiad-2026` (dashboard)

`PageHead`: crumbs; `switcher` Open / Women; h1 short title; status `Tag`; facts = format, the existing meta fragments, chess-results link; `media` = `FlagStack` (medalists or top 8 seeds); `tabs` Medal odds / Board prizes. `SectionBar` (finished): Podium `#podium`, Final-round odds `#race`, Teams `#teams`, How it works `#method`; (live): Gold race, Results, Teams, How it works; live slot = event name and "After round N" or leader and gold odds.

Finished, first screen: `Section split ratio="5/7"` `#podium`: left `Podium layout="stack"` (flag `hero` for first, `xl` for others, name `type-h1` / `type-h3` through `fitTitle`, MP, GP, SB as `Stat sm`, tiebreak note, "18.0% before round 1"); right the gold-odds `LineChart` (`MedalHistoryChart` data, champion `strong`, others `context`, metric `Segmented` Gold / Medal / Top 10, `onSeries` opens the team). Finding computed: pre-tournament favourite and value, and the round from which the champion led for good. No player photo in the hero.

`#race` (`HeroPanel` as `Section wide` with `Tabs`): Gold race / "Final-round odds" = `RaceRows` with ruled header, gold/silver/bronze legend, scenario baseline tick and `Delta`, selected state, prefetch on hover/focus; Round N = `MatchRow` list with team filter `Input`, apply-results `Callout`, show more; Trend = `LineChart` (live events only; finished ones already show it above). `MoversStrip` = `ScrollRow` of `Chip`s. Default tab logic unchanged.

Team spotlight = `Panel` under the race: head (flag, name, seed and average, standing line, next match, `Sparkline`, Copy link, prev/next/close `IconButton`s, arrow-key behaviour, focus management), `StatStrip` of four (Gold, Podium with medal `SplitBar`, Top 10, Expected finish), then four columns (two on tablet, `Disclosure`s on phone): Roster `Table compact` with links and TPR; Results and `LikelyOpponents`; Finish distribution `ColumnChart` (medal tones for 1 to 3, median marked); Remaining rounds `SplitBar` W/D/L with result tones. `Skeleton`s, errors and stale run handling kept.

`#teams`: `Split` while live: main = scenario summary `Callout` (sentence, matched count, low-sample warnings, copy, clear), `SpotlightHint` `Callout`, "All 206 teams" `Table`; aside = `ScenarioPanel` sticky under the bar. Finished: table full width. Table: Pos (2), Team with flag and seed (1), Rating (4), MP (1), Gold `Meter` (1), Podium `Meter tone="ink"` (2), Finish (1), chevron; podium rows carry a `Medal`; sortable heads; `SearchInput`; 25 rows then "Show all 206"; row click toggles the spotlight with the same aria labels.

`ScenarioPanel` contents: view `Segmented` (By round / Team path), round row with states (simulated, pairings out, projected, played; legend in words), `SearchInput`, sort `Segmented`, `MatchRow`s with `PickToggle`-style team buttons and W/D/L `SplitBar`, byes, projected and played `Callout`s, `CompletedRoundList` as `MatchRow`s, team path list, MAX_PICKS note, Simulate / Reset. Phone: `BottomBar` + `Sheet`. `#method`: `Explainer columns=3`, links and non-participants note.

No run yet: `EmptyState` "Simulations coming soon".

### 11.8 Board prizes `.../boards` (dashboard)

Same `PageHead` with the Board prizes tab. Board `Segmented` (Board 1 to 4, Reserve with leader flag) doubles as the section's control; keeps `?board=`, `?team=` and the phone sticky behaviour by living in the `SectionBar` live slot. `Podium layout="row"` strip: five columns separated by `line` (phone: `ScrollRow` snap), each a button with label, ranked count or "New leader", three rows with `Medal`, flag, name, mover `Delta`, TPR. `Section wide` "Board 1 race": player `Combobox`, Copy link, min-games `Segmented`, reachable `Checkbox`, team `Chip` with clear; `Table`: rank, player (flag, title, name link, team), TPR, Score, Form `Pips`, 8 games `Pips eligibility`, Avg opp; show all; error `Callout`; before round 1 `EmptyState`. `Explainer` for "How board medals work" with its note.

### 11.9 Player `.../players/[fideId]` (dashboard, no SectionBar)

`PageHead` h1 = name with title as `Tag brand`; facts: team link, board, rating; actions: Copy link, previous/next on the board; `media` flag `hero`. `StatStrip`: Performance (with `Delta` against rating), Board rank (`Medal` when 1 to 3), Score (W D L, average opponent), Eligibility (`Pips`). `Split`: main "Games" (`Pips form size=20`; `Rows` of games, each expanding a `GameViewer`; hash behaviour kept); aside "Round by round" `LineChart points="all"` with rating `refs`, "Board 1 top 5" `Rows` with current player highlighted, full race link. TPR footnote.

### 11.10 Candidates `/simulations/candidates-2026`, `womens-candidates-2026`, `candidates-2024`, `womens-candidates-2024` (dashboard)

One composition, `components/simulation/CandidatesPage.tsx`, props per event. `PageHead` h1 event name, lead description, facts format and FIDE link, `media` `AvatarStack` (2026 only, as today). Standfirst intro paragraph for 2026 (text kept; "Scenario Builder" in `font-medium`). `Section` "Simulation results": `Split`: main `LineChart` (winner or current leader `strong`, every series keeps its player tone on hover/focus, all players in the table) or `BarRows` when only Pre/Simulated rows exist, with "Predictions updated to reflect your scenario selections" `Callout` and "Based on N simulations"; loading dims to 50% with `aria-busy` (no blur). Aside: `ScenarioPanel` (round row, `MatchRow`s with `PickToggle sm` 1 / = / 0 and avatars, completed rounds as `Disclosure`s, summary, Simulate, Reset; collapsible on phones; sticky from 1024). When every round is complete the panel says so in one line above the disclosures and Simulate stays. "How it works" `Explainer columns=3` + blog link (2026 pages).

### 11.11 Legacy 2024

- **World Championship Singapore 2024:** `PageHead`; `Callout brand` "Archived: ..." with link to 2026. "Simulated results by round" `LineChart` (Ding `series-1`, Gukesh `series-2`, draw/tiebreak series as `context`), simulation count; `ScenarioPanel` with 14 `MatchRow`s and `Update simulations`. POST API untouched.
- **Budapest 2024:** `PageHead`; `Callout brand icon="medal"` "Congrats to India ..." (no emoji). `LineChart` (or `BarRows` at round 0) of the top 8, `Table` of medal chances with `Flag` from `olympiadTeamMap.json` codes (3-letter badge when a code has no ISO flag), sortable Gold/Silver/Bronze, simulation count; `Prose` methodology.

### 11.12 Not found

`Page` landing, `Section plain`: h1 "Page not found" (`type-mega`), lead "There is no page at this address." Buttons `Go home` and `Visit the blog`.

### 11.13 States every dashboard handles

Loading (`Skeleton`/`EmptyState busy`), no data, error (`Callout negative`), live (dot + refresh), scenario active (Deltas everywhere, label), finished/champion, stale run, reduced motion, 320px, keyboard only, dark and light.

---

## 12. OG images

`lib/og/kit.tsx` (Satori; inline styles allowed, colours only from `TOKENS.dark`): `OgFrame` (1200x630, `canvas`, 56px padding, 4px `rule` line at the top, "Pawnalyze" wordmark text left, stage right, footer line), `OgTitle`, `OgRow` (rank, flag, name, bar, value), `OgSplit` (two figures + 20px split bar), `OgPortrait` (field block + cut-out PNG), `OgFlag`, `OgMedal`, `clip()`. Fonts: pass `PawnalyzeDisplay-og.ttf` and `HankenGrotesk-{Regular,SemiBold}-og.ttf` read with `readFileSync` from `assets/fonts` (add them and `public/players/wcc/*-og.png` to `outputFileTracingIncludes`); if a font fails to load, fall back to Satori's default, never fail the image. No gradients, no tracked capitals. `safeOg` fallback card uses `OgFrame`.

Cards: WCC (portraits either side on their fields, names, two 110px figures, split bar, tiebreak share, stage, simulations line); Olympiad odds x2 (top five rows; finished: podium with medal rules); boards x2 (five columns of three); player x2 (flag, name, TPR, rank medal, score, eligibility). Same data and copy as today. The root metadata's remote image stays.

---

## 13. Assets and licences

- `gukesh-cut.webp` / `sindarov-cut.webp` (704x948, transparent, black and white) and `*-cut-og.png` are adaptations of the repo's Commons portraits. Add `cutout` and `cutoutOg` entries to `WCC_PHOTOS` with the same source objects and `modified: 'Background removed, converted to black and white, resized and converted to WebP'` (PNG for og). Gukesh's stays **CC BY-SA 2.0, adaptation shared under CC BY-SA 2.0**; Sindarov's CC BY 4.0. Include both in `ALL_WCC_PHOTO_CREDITS`.
- Wherever a photograph appears, its `PhotoCaption` is visible on the same page near it; full TASL list at `#photo-credits` on the WCC page. Home and index show caption lines under the face-off.
- Candidates avatars have no licence records in the repo. They keep their current small use and get no new, larger use. Do not add photographs without a licence entry.
- Fonts: OFL texts ship in `assets/fonts`. Chess pieces: SVG set in `public/img/chesspieces` (the PNG copies are unused after `Board`).
- Logo: `lib/theme/logo.ts` holds the paths (mark, small cut, outlined wordmark). `components/layout/Logo.tsx`, the Open Graph images and the app icons (`app/icon.svg`, `favicon.ico`, `apple-icon.png`, `public/img/icon-*.png`) are drawn from them. The mark is a pawn whose body is a bell curve, standing on a rule: one colour, always `ink` on the page, light on petrol in icons.

---

## 14. Build order and ownership

First commit (one engineer, before the others branch): tokens, Tailwind, fonts, `lib/theme`, `lib/utils`, `lib/format`, globals, lint scripts, and **every component file in section 8 with its exact props and a working minimal body**, so all six can compile against the contract. Then in parallel:

| Engineer | Owns |
|---|---|
| A Foundation | `app/layout.tsx`, `globals.css`, `fonts.ts`, `components/layout/*`, `scripts/*`, eslint, not-found, about |
| B Primitives | `components/ui/*` |
| C Charts and chess | `components/charts/*`, `components/chess/*` except `FaceOff`, `GameSheet`, `MatchCalendar` |
| D World Championship | `components/wcc/*`, `components/live/*`, `FaceOff`, `GameSheet`, `MatchCalendar`, WCC OG, `lib/wcc/photos.ts` |
| E Olympiad | `components/olympiad/**`, Olympiad OG |
| F Events and tools | home, simulations index, `components/elocator/*`, `components/simulation/*`, `playerData`, 2024 pages, `lib/og/kit.tsx` |

A change to a shared prop is a change to this file first. Nobody edits a file outside their row except to fix an import. Delete replaced files in the same commit that replaces their last use.

## 15. Acceptance

1. `npm run lint` clean (drift 0, contrast 0), `tsc --noEmit` clean, `next build` clean.
2. Every route at 320, 390, 768, 1024, 1440 in both themes: no sideways overflow, no zoom-out beyond the page on a phone (layout width equals device width), no console or hydration errors, no text under 12px, controls 44px or taller.
3. Home and WCC each show a `Watch live` button above the fold at 1440x900 and within the first 900px at 390; every game number in the sheet and calendar opens `/world-chess-championship-2026/live?game=N`.
4. WCC phone: first percentage starts by y=440 at 390x844; bottom bar hidden over the hero, shown after it, never over content; picks update hero, chip, charts and prize.
5. All old anchors, query parameters, keyboard shortcuts, aria labels, tables and credits still present (compare with `main` route by route).
6. `grep -rE "chart\.js|recharts"` finds nothing outside `components/charts/adapters.ts`; gold appears only in its listed jobs; one `type-figure` pair per page.
7. Reduced motion: nothing animates, nothing is hidden. Keyboard: skip link, visible ring everywhere, focus never under the bar.
