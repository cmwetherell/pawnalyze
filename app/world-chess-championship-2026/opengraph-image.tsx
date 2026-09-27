import { OG_SIZE } from '@/lib/og';
import { wccOgImage } from '@/lib/wcc/ogImage';

export const alt = 'World Chess Championship 2026: Gukesh vs Sindarov match odds';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return wccOgImage();
}
