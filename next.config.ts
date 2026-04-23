import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output for Cloud Run container deployment
  output: "standalone",

  // Genkit + Firebase use native Node modules — exclude from client bundling
  serverExternalPackages: [
    "genkit",
    "@genkit-ai/google-genai",
    "@genkit-ai/next",
  ],

  images: {
    remotePatterns: [],
  },

  // Comprehensive security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer information
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS (1 year)
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Disable unnecessary browser features
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Legacy XSS protection
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // DNS prefetch control
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Stricter headers for API routes
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
