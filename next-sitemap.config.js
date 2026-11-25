/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://pawnalyze.com',
    generateRobotsTxt: true, // Optional: to generate robots.txt
    // The component catalogue is for people working on the site.
    exclude: ['/styleguide'],
    additionalPaths: async (config) => [
        await config.transform(config, '/world-chess-championship-2026'),
        await config.transform(config, '/simulations/chess-olympiad-2026/boards'),
        await config.transform(config, '/simulations/womens-chess-olympiad-2026/boards'),
    ],
    robotsTxtOptions: {
        policies: [{ userAgent: '*', allow: '/', disallow: '/styleguide' }],
        additionalSitemaps: [
        'https://blog.pawnalyze.com/sitemap.xml',
        ],
    },

  };