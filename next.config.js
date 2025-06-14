/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static optimization to avoid React 19 SSR useContext bug
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "www.pngall.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/auth/signin",
        destination: "/auth/signin",
      },
      {
        source: "/auth/signup",
        destination: "/auth/signup",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/auth/:path*",
        headers: [
          {
            key: "x-prerender-revalidate",
            value: "false",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
