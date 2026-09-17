import { OG_SIZE, playerOgImage } from '@/lib/olympiad/ogImage';

export const alt = 'Olympiad board prize race player card';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ fideId: string }> }) {
  const { fideId } = await params;
  return playerOgImage('women', Number(fideId));
}
