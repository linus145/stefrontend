import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          // Using localhost instead of 127.0.0.1 ensures cookies map to the frontend domain.
          // Trailing slash ensures Django's APPEND_SLASH does not throw a 500 error on POSTs.
          destination: 'http://localhost:8000/api/:path*/', 
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
