/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://pawnalyze.com',
    generateRobotsTxt: true, // Optional: to generate robots.txt
    // other configurations...
    robotsTxtOptions: {
        additionalSitemaps: [
        'https://blog.pawnalyze.com/sitemap.xml',
        ],
    },

  };