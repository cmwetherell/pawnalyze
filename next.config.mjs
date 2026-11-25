const OG_FILES = ['./assets/fonts/*-og.ttf', './node_modules/flag-icons/flags/4x3/*.svg', './public/players/wcc/*-og.png'];
const OG_ROUTES = [
  '/opengraph-image',
  '/world-chess-championship-2026/opengraph-image',
  '/world-chess-championship-2026/live/opengraph-image',
  ...['/simulations/chess-olympiad-2026', '/simulations/womens-chess-olympiad-2026'].flatMap(event => [
    `${event}/opengraph-image`, `${event}/boards/opengraph-image`, `${event}/players/*/opengraph-image`,
  ]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    // Open Graph images read fonts, flags and player cut-outs from disk when they are drawn (lib/og/kit.tsx).
    outputFileTracingIncludes: Object.fromEntries(OG_ROUTES.map(route => [route, OG_FILES])),

        async redirects() {
          return [
            {
              // does not add /docs since basePath: false is set
              source: '/chess-drama/2022/09/05/Analyzing-Allegations-Niemann-Cheating-Scandal.html',
              destination: 'https://blog.pawnalyze.com/chess-drama/2022/09/05/Analyzing-Allegations-Niemann-Cheating-Scandal.html',
              basePath: false,
              permanent: true,
            },
          ]
        },
        };

export default nextConfig;
