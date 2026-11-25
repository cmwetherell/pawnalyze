/**
 * Photos used on the World Chess Championship 2026 page (Gukesh D vs Javokhir Sindarov).
 *
 * Every image comes from Wikimedia Commons under a free license (CC BY / CC BY-SA).
 * Licenses, authors and source pages were verified against the Commons API
 * (imageinfo + extmetadata) on 2026-09-27. The files in /public were cropped
 * and resized from the Commons originals; adaptations of CC BY-SA works are
 * shared under the same CC BY-SA license as the original.
 *
 * Attribution (TASL: Title, Author, Source, License + modifications) must be
 * shown for every image — render ALL_WCC_PHOTO_CREDITS in the page's credits section.
 */

export interface PhotoCredit {
  /** Public path of the processed file */
  src: string;
  alt: string;
  /** Plain-text author, as given on Commons */
  author: string;
  authorUrl?: string;
  /** License short name (CC BY-SA adaptations note the ShareAlike terms) */
  license: string;
  licenseUrl: string;
  /** Commons File: description page */
  sourceUrl: string;
  /** Title of the work on Commons */
  title: string;
  /** Changes made to the original */
  modified: string;
  width: number;
  height: number;
  /** CSS object-position hint for the subject, e.g. '50% 30%' */
  focal?: string;
}

// ── Source works ─────────────────────────────────────────────────────────────

const GUKESH_PORTRAIT_SOURCE = {
  author: 'Frans Peeters',
  authorUrl: 'https://www.flickr.com/photos/suspeeters/',
  license: 'CC BY-SA 2.0 (adaptation shared under CC BY-SA 2.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gukesh_in_2024_(cropped).jpg',
  title: 'Gukesh in 2024 (cropped)',
} as const;

const GUKESH_BOARD_SOURCE = {
  author: 'Frans Peeters',
  authorUrl: 'https://www.flickr.com/photos/suspeeters/',
  license: 'CC BY-SA 2.0 (adaptation shared under CC BY-SA 2.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:NZ9_0632_t_03.jpg',
  title: 'Gukesh D, Tata Steel Chess Tournament 2025, Round 1 (NZ9 0632 t 03)',
} as const;

const SINDAROV_PORTRAIT_SOURCE = {
  author: 'ChessKelly (Kelly Centrelli / Charlotte Chess Center)',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  sourceUrl:
    'https://commons.wikimedia.org/wiki/File:Javokhir_Sindarov_at_the_Naroditsky_Memorial_Rapid_and_Blitz_2026.jpg',
  title: 'Javokhir Sindarov at the Naroditsky Memorial Rapid and Blitz 2026',
} as const;

const SINDAROV_BOARD_SOURCE = {
  author: 'TheBoburshokh',
  authorUrl: 'https://commons.wikimedia.org/wiki/User:TheBoburshokh',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Javoxir_Sindarov.jpg',
  title: 'Javoxir Sindarov (46th FIDE Chess Olympiad, 2026)',
} as const;

const VENUE_SOURCE = {
  author: 'Alpra ArazeL',
  license: 'CC BY-SA 4.0 (adaptation shared under CC BY-SA 4.0)',
  licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:Fondation_Martin_Bodmer.jpg',
  title: 'Fondation Martin Bodmer',
} as const;

// ── Processed files ──────────────────────────────────────────────────────────

export const WCC_PHOTOS: {
  gukesh: { portrait: PhotoCredit; cutout: PhotoCredit; og: PhotoCredit; cutoutOg: PhotoCredit; avatar: PhotoCredit; board?: PhotoCredit };
  sindarov: { portrait: PhotoCredit; cutout: PhotoCredit; og: PhotoCredit; cutoutOg: PhotoCredit; avatar: PhotoCredit; board?: PhotoCredit };
  venue: PhotoCredit & { og: string };
} = {
  gukesh: {
    // Looking down, head turned toward the viewer's right (faces center when placed on the left).
    portrait: {
      ...GUKESH_PORTRAIT_SOURCE,
      src: '/players/wcc/gukesh-portrait.webp',
      alt: 'Gukesh D at the board during the Tata Steel Chess Tournament 2024',
      modified: 'Cropped to head and shoulders, resized and converted to WebP',
      width: 720,
      height: 960,
      focal: '50% 35%',
    },
    // The portrait on its own, for the face-off.
    cutout: {
      ...GUKESH_PORTRAIT_SOURCE,
      src: '/players/wcc/gukesh-cut.webp',
      alt: 'Gukesh D at the board during the Tata Steel Chess Tournament 2024',
      modified: 'Background removed, converted to black and white, resized and converted to WebP',
      width: 704,
      height: 948,
    },
    cutoutOg: {
      ...GUKESH_PORTRAIT_SOURCE,
      src: '/players/wcc/gukesh-cut-og.png',
      alt: 'Gukesh D at the board during the Tata Steel Chess Tournament 2024',
      modified: 'Background removed, converted to black and white, resized and converted to PNG',
      width: 475,
      height: 640,
    },
    og: {
      ...GUKESH_PORTRAIT_SOURCE,
      src: '/players/wcc/gukesh-og.jpg',
      alt: 'Gukesh D at the board during the Tata Steel Chess Tournament 2024',
      modified: 'Cropped to head and shoulders and resized',
      width: 480,
      height: 640,
      focal: '50% 35%',
    },
    avatar: {
      ...GUKESH_PORTRAIT_SOURCE,
      src: '/players/gukesh.webp',
      alt: 'Gukesh D',
      modified: 'Cropped to a square face crop, resized and converted to WebP',
      width: 500,
      height: 500,
      focal: '50% 45%',
    },
    // Looking down-left at the board (viewer's left).
    board: {
      ...GUKESH_BOARD_SOURCE,
      src: '/players/wcc/gukesh-board.webp',
      alt: 'Gukesh D studying the position at the Tata Steel Chess Tournament 2025',
      modified: 'Cropped to 16:9, resized and converted to WebP',
      width: 1280,
      height: 720,
      focal: '70% 30%',
    },
  },
  sindarov: {
    // Face-forward, direct gaze at the camera.
    portrait: {
      ...SINDAROV_PORTRAIT_SOURCE,
      src: '/players/wcc/sindarov-portrait.webp',
      alt: 'Javokhir Sindarov at the Naroditsky Memorial Rapid and Blitz 2026',
      modified: 'Cropped to head and shoulders, resized and converted to WebP',
      width: 720,
      height: 960,
      focal: '50% 35%',
    },
    // The portrait on its own, for the face-off.
    cutout: {
      ...SINDAROV_PORTRAIT_SOURCE,
      src: '/players/wcc/sindarov-cut.webp',
      alt: 'Javokhir Sindarov at the Naroditsky Memorial Rapid and Blitz 2026',
      modified: 'Background removed, converted to black and white, resized and converted to WebP',
      width: 704,
      height: 948,
    },
    cutoutOg: {
      ...SINDAROV_PORTRAIT_SOURCE,
      src: '/players/wcc/sindarov-cut-og.png',
      alt: 'Javokhir Sindarov at the Naroditsky Memorial Rapid and Blitz 2026',
      modified: 'Background removed, converted to black and white, resized and converted to PNG',
      width: 475,
      height: 640,
    },
    og: {
      ...SINDAROV_PORTRAIT_SOURCE,
      src: '/players/wcc/sindarov-og.jpg',
      alt: 'Javokhir Sindarov at the Naroditsky Memorial Rapid and Blitz 2026',
      modified: 'Cropped to head and shoulders and resized',
      width: 480,
      height: 640,
      focal: '50% 35%',
    },
    avatar: {
      ...SINDAROV_PORTRAIT_SOURCE,
      src: '/players/sindarov.webp',
      alt: 'Javokhir Sindarov',
      modified: 'Cropped to a square face crop, resized and converted to WebP',
      width: 500,
      height: 500,
      focal: '50% 45%',
    },
    // Smiling toward the camera, board in the lower left.
    board: {
      ...SINDAROV_BOARD_SOURCE,
      src: '/players/wcc/sindarov-board.webp',
      alt: 'Javokhir Sindarov smiling at the board at the 46th FIDE Chess Olympiad, 2026',
      modified: 'Cropped to 16:9, resized and converted to WebP',
      width: 1280,
      height: 720,
      focal: '65% 30%',
    },
  },
  venue: {
    ...VENUE_SOURCE,
    src: '/img/wcc/venue.webp',
    og: '/img/wcc/venue-og.jpg', // 1200×800 JPEG, same crop (full frame)
    alt: 'Forecourt of the Fondation Martin Bodmer in Cologny, Geneva, overlooking Lake Geneva',
    modified: 'Resized and converted to WebP / JPEG',
    width: 1600,
    height: 1067,
    focal: '60% 50%',
  },
};

/** One credit per source work (deduped by Commons page), with every change made to it, for the page's photo credits section. */
export const ALL_WCC_PHOTO_CREDITS: PhotoCredit[] = (() => {
  const all: PhotoCredit[] = [WCC_PHOTOS.gukesh, WCC_PHOTOS.sindarov]
    .flatMap(p => [p.portrait, p.cutout, p.cutoutOg, p.og, p.avatar, ...(p.board ? [p.board] : [])])
    .concat(WCC_PHOTOS.venue);
  // The same change in another file format is said once.
  const change = (p: PhotoCredit) => p.modified.replace(/ and converted to \S+$/, '');
  const bySource = new Map<string, PhotoCredit>();
  for (const p of all) {
    const seen = bySource.get(p.sourceUrl);
    if (!seen) bySource.set(p.sourceUrl, p);
    else if (!seen.modified.includes(change(p))) bySource.set(p.sourceUrl, { ...seen, modified: `${seen.modified}. ${p.modified}` });
  }
  return [...bySource.values()];
})();
