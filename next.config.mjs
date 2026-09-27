/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    // The Olympiad OG images read flag SVGs from flag-icons at render time.
    outputFileTracingIncludes: {
      '/simulations/chess-olympiad-2026/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
      '/simulations/womens-chess-olympiad-2026/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
    '/simulations/chess-olympiad-2026/boards/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
    '/simulations/womens-chess-olympiad-2026/boards/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
    '/simulations/chess-olympiad-2026/players/[fideId]/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
    '/simulations/womens-chess-olympiad-2026/players/[fideId]/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
    // The World Championship OG image reads the player portraits and two flags from disk.
    '/world-chess-championship-2026/opengraph-image': [
      './public/players/wcc/*-og.jpg',
      './node_modules/flag-icons/flags/4x3/in.svg',
      './node_modules/flag-icons/flags/4x3/uz.svg',
    ],
    },

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
