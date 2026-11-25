import { OG_SIZE, OgFrame, OgMark, ogDisplay, ogImage } from '@/lib/og/kit';

export const alt = 'Pawnalyze: forecasts for championship chess';
export const size = OG_SIZE;
export const contentType = 'image/png';

/** The card of every page that has none of its own. */
export default async function Image() {
  return ogImage('Pawnalyze', () => (
    <OgFrame footer="Match odds, tournament simulations and position complexity">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column', ...ogDisplay(104, { letterSpacing: -2 }) }}>
          <span>Forecasts for</span>
          <span>championship</span>
          <span>chess</span>
        </div>
        <OgMark width={310} />
      </div>
    </OgFrame>
  ), 'Forecasts for championship chess');
}
