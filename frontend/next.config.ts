/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/assets/traits/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/generated-images/**',
      },
      {
        protocol: 'https',
        hostname: 'ipfs.primalcult.xyz',
        pathname: '/images/**',
      },

    ],
  },
};

module.exports = nextConfig;