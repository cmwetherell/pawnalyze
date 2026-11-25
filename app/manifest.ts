import type { MetadataRoute } from 'next';

import { TOKENS } from '@/lib/theme/tokens.generated';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pawnalyze',
    short_name: 'Pawnalyze',
    start_url: '/',
    display: 'browser',
    background_color: TOKENS.dark.canvas,
    theme_color: TOKENS.dark.canvas,
    icons: [192, 512].map(n => ({ src: `/img/icon-${n}.png`, sizes: `${n}x${n}`, type: 'image/png' })),
  };
}
