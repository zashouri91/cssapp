import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [], // Add required domains
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.dev;
              style-src 'self' 'unsafe-inline';
              img-src 'self' blob: data: https://*.clerk.dev https://*.clerk.accounts.dev;
              font-src 'self';
              worker-src 'self' blob:;
              frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.dev;
              connect-src 'self' https://*.supabase.co https://*.clerk.dev https://*.clerk.accounts.dev;
            `.replace(/\s+/g, ' ').trim()
          }
        ]
      }
    ];
  }
};

export default nextConfig;
