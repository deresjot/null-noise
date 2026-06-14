import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    deviceSizes: [320, 390, 430, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 160, 192, 256, 384, 512, 640, 768],
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  reactStrictMode: true,
  async headers() {
    const scriptSrc =
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'";
    const connectSrc =
      process.env.NODE_ENV === "development"
        ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:*"
        : "connect-src 'self'";
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          scriptSrc,
          "style-src 'self' 'unsafe-inline'",
          "font-src 'self'",
          "img-src 'self' data: blob:",
          connectSrc,
          "manifest-src 'self'",
          "worker-src 'self'",
          "frame-src 'none'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "off",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
      {
        source: "/api/poster/tmdb/:path*",
        headers: [
          ...securityHeaders,
          {
            key: "Cache-Control",
            value: "public, max-age=2678400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
