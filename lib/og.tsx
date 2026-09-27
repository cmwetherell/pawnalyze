import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * OG images are prerendered at build time, so a transient database error must not fail
 * the deploy. Render the card; on any failure log it and fall back to a plain title card.
 */
export async function safeOg(
  title: string,
  render: () => Promise<ImageResponse>,
  subtitle = 'Live odds and board-prize race, updated after every round',
): Promise<ImageResponse> {
  try {
    return await render();
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : JSON.stringify(err);
    console.error(`[og] ${title} failed, using fallback card: ${detail}`);
    return new ImageResponse(
      (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '56px', background: 'linear-gradient(135deg, #0F1116 0%, #1a1d23 100%)', color: '#f0f2f5', fontFamily: 'sans-serif' }}>
          <div style={{ display: 'flex', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', color: '#C9A84C' }}>Pawnalyze</div>
          <div style={{ display: 'flex', fontSize: 56, fontWeight: 700, marginTop: 8 }}>{title}</div>
          <div style={{ display: 'flex', fontSize: 26, color: '#8b949e', marginTop: 16 }}>{subtitle}</div>
        </div>
      ),
      { ...OG_SIZE },
    );
  }
}
