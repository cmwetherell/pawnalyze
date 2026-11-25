import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { fedToIso } from '@/lib/olympiad/fedToIso';
import { LOGO_MARK, LOGO_VIEWBOX, LOGO_WORD, LOGO_WORD_AT } from '@/lib/theme/logo';
import { TOKENS } from '@/lib/theme/tokens.generated';

/**
 * Open Graph cards. Satori renders them, so styles are inline and every box with more than one child is `display: flex`.
 * Colours come from the dark tokens only; text is set in the site's own faces (assets/fonts, traced by next.config).
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const ogColor = TOKENS.dark;

const DISPLAY = 'Pawnalyze Display';
const TEXT = 'Hanken Grotesk';
const PAD = 56;

/** The serif, for titles and figures that stand alone. */
export const ogDisplay = (fontSize: number, extra?: CSSProperties): CSSProperties => ({ fontFamily: DISPLAY, fontSize, lineHeight: 1.05, letterSpacing: fontSize > 90 ? -1.5 : fontSize > 60 ? -0.5 : 0, ...extra });

// ---- Files

// Every path spells out its folder, so the build traces that folder and not the whole project.

/** A file as a data URI, or null, so a missing one never fails a card. */
function dataUri(mime: string, read: () => Buffer): string | null {
  try {
    return `data:${mime};base64,${read().toString('base64')}`;
  } catch {
    return null;
  }
}

const flagUri = (iso: string) => dataUri('image/svg+xml', () => readFileSync(path.join(process.cwd(), 'node_modules', 'flag-icons', 'flags', '4x3', `${iso}.svg`)));

/** A PNG from public/players/wcc, by its src. */
export const ogPlayerPhoto = (src: string) => dataUri('image/png', () => readFileSync(path.join(process.cwd(), 'public', 'players', 'wcc', path.basename(src))));

interface OgFont { name: string; data: Buffer; weight: 400 | 600; style: 'normal' }

function loadFonts(): OgFont[] {
  const files = [
    ['PawnalyzeDisplay-og.ttf', DISPLAY, 400],
    ['HankenGrotesk-Regular-og.ttf', TEXT, 400],
    ['HankenGrotesk-SemiBold-og.ttf', TEXT, 600],
  ] as const;
  return files.flatMap(([file, name, weight]) => {
    try {
      return [{ name, data: readFileSync(path.join(process.cwd(), 'assets', 'fonts', file)), weight, style: 'normal' as const }];
    } catch (err) {
      console.error(`[og] font ${file}: ${err instanceof Error ? err.message : err}`);
      return [];
    }
  });
}

// ---- Rendering

/** ImageResponse draws while it streams, so the bytes are awaited here, where a failure can still be caught. */
async function draw(card: ReactElement, fonts: OgFont[]): Promise<Response> {
  const image = new ImageResponse(card, { ...OG_SIZE, ...(fonts.length > 0 ? { fonts } : {}) });
  const bytes = await image.arrayBuffer();
  if (bytes.byteLength === 0) throw new Error('empty image');
  return new Response(bytes, { headers: image.headers });
}

const why = (err: unknown) => (err instanceof Error ? `${err.name}: ${err.message}` : JSON.stringify(err));

/**
 * OG images are prerendered at build time, so a transient database error must not fail the deploy: on any failure the card
 * falls back, first to Satori's own font, then to a plain title card.
 */
export async function ogImage(title: string, card: () => Promise<ReactElement> | ReactElement, subtitle = 'Live odds and board-prize race, updated after every round'): Promise<Response> {
  const fonts = loadFonts();
  const plain = <OgFrame><OgTitle size={72} sub={subtitle}>{title}</OgTitle></OgFrame>;
  let node = plain;
  try {
    node = await card();
  } catch (err) {
    console.error(`[og] ${title} failed, using fallback card: ${why(err)}`);
  }
  try {
    return await draw(node, fonts);
  } catch (err) {
    console.error(`[og] ${title} could not be drawn: ${why(err)}`);
  }
  try {
    return await draw(node, []);
  } catch {
    return draw(plain, []);
  }
}

// ---- Words

/** Satori cannot ellipsize, so names are capped by length. */
export function clip(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}

export const ogPct = (v: number): string => `${(v * 100).toFixed(1)}%`;

// ---- Parts

export function OgLogo({ height = 40 }: { height?: number }) {
  const { width: w, height: h } = LOGO_VIEWBOX;
  return (
    <svg width={Math.round((height * w) / h)} height={height} viewBox={`0 0 ${w} ${h}`} fill={ogColor.ink}>
      <path d={LOGO_MARK} />
      <path d={LOGO_WORD} transform={`translate(${LOGO_WORD_AT.x} ${LOGO_WORD_AT.y})`} />
    </svg>
  );
}

/** The mark on its own, cropped to its ink so its rule can stand on the card's edge. */
export function OgMark({ width, color = ogColor.ink }: { width: number; color?: string }) {
  return <svg width={width} height={Math.round((width * 57) / 56)} viewBox="4 3.5 56 57" fill={color}><path d={LOGO_MARK} /></svg>;
}

interface OgFrameProps {
  /** Right of the logo: "After game 1 of 14". */
  stage?: ReactNode;
  /** Under the stage, quieter. */
  stageNote?: ReactNode;
  /** Bottom line, left; the address stands at its right. */
  footer?: ReactNode;
  children: ReactNode;
}

/** Ground, a 4px rule, the logo and the stage, the card, one line at the bottom. */
export function OgFrame({ stage, stageNote, footer, children }: OgFrameProps) {
  return (
    <div
      style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: `48px ${PAD}px 40px`,
        background: ogColor.canvas, color: ogColor.ink, fontFamily: TEXT, fontSize: 24, fontWeight: 400,
      }}
    >
      <div style={{ display: 'flex', height: 4, background: ogColor.rule }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 76 }}>
        <OgLogo />
        {(stage || stageNote) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {stageNote && <span style={{ color: ogColor['ink-3'] }}>{stageNote}</span>}
            {stage && <span style={{ color: ogColor['ink-2'], fontWeight: 600 }}>{stage}</span>}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>{children}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: 40, fontSize: 20, color: ogColor['ink-3'] }}>
        <span>{footer ?? ''}</span>
        <span style={{ color: ogColor['ink-2'] }}>pawnalyze.com</span>
      </div>
    </div>
  );
}

/** Card title with an optional line under it. */
export function OgTitle({ size = 64, sub, children }: { size?: number; sub?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', ...ogDisplay(size) }}>{children}</div>
      {sub && <div style={{ display: 'flex', marginTop: 12, fontSize: 26, color: ogColor['ink-2'] }}>{sub}</div>}
    </div>
  );
}

/** From the installed flag-icons package, so no network while prerendering. Codes with no flag show their letters. */
export function OgFlag({ code, height }: { code: string | null | undefined; height: number }) {
  const iso = fedToIso(code ?? undefined);
  const src = iso ? flagUri(iso) : null;
  const size = { width: Math.round((height * 4) / 3), height, borderRadius: 2, flexShrink: 0 };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={size.width} height={height} style={size} />
  ) : (
    <div style={{ ...size, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ogColor.sunken, color: ogColor['ink-2'], fontSize: Math.round(height * 0.4) }}>{code ?? ''}</div>
  );
}

const MEDAL = { 1: ['gold', 'on-gold'], 2: ['silver', 'on-silver'], 3: ['bronze', 'on-bronze'] } as const;

export const ogMedalColor = (rank: 1 | 2 | 3): string => ogColor[MEDAL[rank][0]];

export function OgMedal({ rank, size = 28 }: { rank: 1 | 2 | 3; size?: number }) {
  return (
    <div
      style={{
        display: 'flex', width: size, height: size, borderRadius: size, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
        background: ogMedalColor(rank), color: ogColor[MEDAL[rank][1]], fontSize: Math.round(size * 0.58), fontWeight: 600, lineHeight: 1,
      }}
    >
      {rank}
    </div>
  );
}

interface OgRowProps { rank: number; code: string | undefined; name: string; /** 0..1, the filled part of the bar. */ share: number; value: string; color?: string }

/** Rank, flag, name, bar, value, on a hairline. */
export function OgRow({ rank, code, name, share, value, color = ogColor.ink }: OgRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 68, borderTop: `1px solid ${ogColor.line}` }}>
      <span style={{ width: 44, color: ogColor['ink-3'], fontSize: 26 }}>{rank}</span>
      <OgFlag code={code} height={36} />
      <span style={{ width: 360, marginLeft: 20, fontSize: 28, fontWeight: 600 }}>{clip(name, 24)}</span>
      <div style={{ display: 'flex', flex: 1, height: 12, background: share > 0 ? ogColor.sunken : ogColor.canvas, borderRadius: 2 }}>
        {share > 0 && <div style={{ display: 'flex', width: `${Math.max(1, share * 100)}%`, background: color, borderRadius: 2 }} />}
      </div>
      <span style={{ width: 150, justifyContent: 'flex-end', ...ogDisplay(38), color: share > 0 ? ogColor.ink : ogColor['ink-3'] }}>{value}</span>
    </div>
  );
}

/** A figure with its unit set smaller and quieter. */
export function OgFigure({ value, unit, size }: { value: string; unit?: string; size: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', ...ogDisplay(size, { lineHeight: 0.9, letterSpacing: -3 }) }}>
      <span>{value}</span>
      {unit && <span style={{ fontSize: Math.round(size * 0.44), lineHeight: 1, letterSpacing: 0, marginLeft: 6, color: ogColor['ink-3'] }}>{unit}</span>}
    </div>
  );
}

/** Two shares of one whole, parted by a gap. */
export function OgSplit({ share, height = 20, colors = [ogColor.p1, ogColor.p2] }: { share: number; height?: number; colors?: [string, string] }) {
  const left = Math.min(99, Math.max(1, share * 100));
  return (
    <div style={{ display: 'flex', gap: 4, height }}>
      {share > 0 && <div style={{ display: 'flex', width: share >= 1 ? '100%' : `${left}%`, background: colors[0], borderRadius: 2 }} />}
      {share < 1 && <div style={{ display: 'flex', flex: 1, background: colors[1], borderRadius: 2 }} />}
    </div>
  );
}

/** A cut-out standing in a field of the player's colour and breaking out of its top edge. */
export function OgPortrait({ src, field, width, height }: { src: string | null; field: string; width: number; height: number }) {
  return (
    <div style={{ display: 'flex', position: 'relative', width, height, flexShrink: 0 }}>
      <div style={{ display: 'flex', position: 'absolute', left: 0, right: 0, bottom: 0, top: Math.round(height * 0.13), background: field }} />
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" width={width} height={height} style={{ position: 'absolute', left: 0, bottom: 0, width, height, objectFit: 'cover', objectPosition: '50% 100%' }} />
      )}
    </div>
  );
}

const RESULT = { 1: ['W', ogColor.ink, ogColor['ink-inverse']], 0.5: ['D', ogColor.draw, ogColor['on-draw']], 0: ['L', ogColor.canvas, ogColor.ink] } as const;

/** One square per round: filled win, grey draw, outlined loss; a short line where there was no game. */
export function OgPips({ results, size = 36 }: { results: (0 | 0.5 | 1 | null)[]; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {results.map((r, i) => r === null ? (
        <div key={i} style={{ display: 'flex', width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', width: size / 2, height: 2, background: ogColor.control }} />
        </div>
      ) : (
        <div
          key={i}
          style={{
            display: 'flex', width: size, height: size, borderRadius: 2, alignItems: 'center', justifyContent: 'center', fontSize: Math.round(size * 0.5), fontWeight: 600,
            background: RESULT[r][1], color: RESULT[r][2], border: r === 0 ? `2px solid ${ogColor.control}` : `2px solid ${RESULT[r][1]}`,
          }}
        >
          {RESULT[r][0]}
        </div>
      ))}
    </div>
  );
}
