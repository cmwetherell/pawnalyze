import type { Metadata } from 'next';

const SITE = 'Pawnalyze';

/** A page's title and description, for the tab, search results and shared links alike. `image: 'site'` for pages without their own share image. */
export function pageMeta(name: string, description: string, { path, image }: { path: string; image?: 'site' }): Metadata {
  const title = `${name} | ${SITE}`;
  const images = image === 'site' ? ['/opengraph-image'] : undefined;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', locale: 'en_US', siteName: SITE, url: path, ...(images && { images }) },
    twitter: { card: 'summary_large_image', site: '@pawnalyze', creator: '@pawnalyze', title, description, ...(images && { images }) },
  };
}
