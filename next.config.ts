import type { NextConfig } from "next";

const EXT_CORS_HEADERS = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
];

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        // Allow browser extension origins on all /api/extension/* routes
        source: "/api/extension/:path*",
        headers: EXT_CORS_HEADERS,
      },
    ];
  },
};

export default nextConfig;
