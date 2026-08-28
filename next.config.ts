import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rules = [
      {
        source: '/hrtools/:path*',
        destination: '/Hrtools/:path*',
      },
      {
        source: '/hrtools',
        destination: '/Hrtools',
      },
    ];

    if (process.env.NODE_ENV === 'development') {
      return [
        ...rules,
        {
          source: '/api/:path*',
          // Using localhost instead of 127.0.0.1 ensures cookies map to the frontend domain.
          // Trailing slash ensures Django's APPEND_SLASH does not throw a 500 error on POSTs.
          destination: 'http://localhost:8000/api/:path*/',
        },
      ];
    }
    return rules;
  },
};

export default nextConfig;
