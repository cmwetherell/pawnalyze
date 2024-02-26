/** @type {import('next').NextConfig} */
const nextConfig = {
    
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
