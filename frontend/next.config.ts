import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Frontend talks to FastAPI on a separate origin (VPS). No Next rewrites required.
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      }
    ]
  }
};

export default nextConfig;
