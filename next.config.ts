import type { NextConfig } from "next";

// Static export is only for Capacitor (`webDir: 'out'`).
// Vercel must NOT use export — static .txt RSC payloads + CDN skew break client navigation
// (browser lands on /dashboard/park.txt). See: https://github.com/vercel/next.js/issues/82417
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(isCapacitorBuild ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['@react-pdf/renderer'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
