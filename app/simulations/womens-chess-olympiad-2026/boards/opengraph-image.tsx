import { OG_SIZE, boardRaceOgImage } from '@/lib/olympiad/ogImage';

export const alt = "Women's Chess Olympiad 2026 board prize race";
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return boardRaceOgImage('women');
}
