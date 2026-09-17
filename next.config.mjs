/** @type {import('next').NextConfig} */
const nextConfig = {
    cacheComponents: true,
    // The Olympiad OG images read flag SVGs from flag-icons at render time.
    outputFileTracingIncludes: {
      '/simulations/chess-olympiad-2026/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
      '/simulations/womens-chess-olympiad-2026/opengraph-image': ['./node_modules/flag-icons/flags/4x3/*.svg'],
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
