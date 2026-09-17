/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://pawnalyze.com',
    generateRobotsTxt: true, // Optional: to generate robots.txt
    // other configurations...
    additionalPaths: async (config) => [
        await config.transform(config, '/simulations/chess-olympiad-2026/boards'),
        await config.transform(config, '/simulations/womens-chess-olympiad-2026/boards'),
    ],
    robotsTxtOptions: {
        additionalSitemaps: [
        'https://blog.pawnalyze.com/sitemap.xml',
        ],
    },

  };