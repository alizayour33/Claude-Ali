import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  images: { formats: ["image/avif", "image/webp"] },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Redirect management: old URLs from the first draft of the site.
  async redirects() {
    return [
      { source: "/machines", destination: "/solutions", permanent: true },
      { source: "/machines/:slug", destination: "/solutions/frozen-dessert", permanent: true },
      { source: "/ar/:path*", destination: "/:path*", permanent: false },
      { source: "/ar", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
