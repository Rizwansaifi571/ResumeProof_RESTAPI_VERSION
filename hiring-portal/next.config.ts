import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for fs-based data store to work on Vercel
  experimental: {
    // Allow reading/writing outside of bundle on serverless
  },
};

export default nextConfig;
