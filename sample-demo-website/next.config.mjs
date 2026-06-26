import { immutableAssetHeaders, noStoreHeaders, securityHeaders } from "./lib/template-hardening.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  compress: true,
  images: {
    unoptimized: true
  },
  eslint: {
    dirs: ["app"]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders
      },
      {
        source: "/api/:path*",
        headers: noStoreHeaders
      },
      {
        source: "/_next/static/:path*",
        headers: immutableAssetHeaders
      }
    ];
  }
};

export default nextConfig;
