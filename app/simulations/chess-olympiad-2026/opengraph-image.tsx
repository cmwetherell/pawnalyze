import { OG_SIZE, olympiadOgImage } from '@/lib/olympiad/ogImage';

export const alt = 'Chess Olympiad 2026 gold-medal odds';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return olympiadOgImage('open');
}
