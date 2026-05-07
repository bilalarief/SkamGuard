import type { NextConfig } from "next";

/**
 * Content Security Policy — tailored to SkamGuard's dependency surface.
 *
 * Directive rationale:
 *   default-src 'self'        — deny all unlisted sources by default
 *   script-src  'unsafe-inline' — required by Next.js App Router inline chunks
 *                                 UPGRADE PATH: add nonce via middleware for strict mode
 *   style-src   'unsafe-inline' — required by Tailwind + framer-motion inline styles
 *   img-src     googleusercontent — Firebase Auth user avatars (Google OAuth photos)
 *   connect-src — Firebase Auth + Firestore REST/gRPC-Web + Google OAuth token endpoints
 *   frame-src   — Google Sign-In OAuth popup
 *   font-src 'self' — fonts are self-hosted via next/font (no Google Fonts CDN)
 *   object-src 'none' — block Flash/plugin execution
 *   base-uri 'self'   — prevent base tag injection attacks
 *   form-action 'self' — prevent form hijacking
 *
 * NOTE: Gemini, VirusTotal, Upstash are server-side only → NOT in connect-src.
 */
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // Next.js App Router requires unsafe-inline; upgrade to nonce for stricter policy
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://accounts.google.com",
  "style-src 'self' 'unsafe-inline'",
  // Self-hosted fonts via next/font — no CDN needed
  "font-src 'self' data:",
  // Local assets + Firebase user avatars + blob URLs for uploaded images
  "img-src 'self' data: blob: https://*.googleusercontent.com https://lh3.googleusercontent.com",
  // All external fetch targets the app makes from the browser
  [
    "connect-src 'self'",
    // Firebase Authentication REST API
    "https://identitytoolkit.googleapis.com",
    "https://securetoken.googleapis.com",
    // Google OAuth token & user info
    "https://accounts.google.com",
    "https://www.googleapis.com",
    "https://apis.google.com",
    // Firestore gRPC-Web
    "https://firestore.googleapis.com",
    // Firebase Realtime DB WebSocket (used by Firebase JS SDK internals)
    "wss://*.firebaseio.com",
    "https://*.firebaseio.com",
    // Firebase Cloud Functions (if called in future)
    "https://*.cloudfunctions.net",
  ].join(" "),
  // Google Sign-In OAuth popup
  "frame-src https://accounts.google.com https://*.firebaseapp.com",
  // Block all plugin/object execution
  "object-src 'none'",
  // Prevent <base> tag injection
  "base-uri 'self'",
  // Prevent form submission hijacking
  "form-action 'self'",
  // Upgrade insecure requests in production
  "upgrade-insecure-requests",
].join("; ");

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
    remotePatterns: [
      {
        // Firebase Auth user profile photos (Google OAuth avatars)
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Content Security Policy — primary XSS/injection defense
          { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
          // Prevent clickjacking (redundant with CSP frame-ancestors but belt+suspenders)
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer leakage
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for 1 year, include subdomains
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
          // Disable unnecessary browser APIs (camera, mic, geolocation for security app)
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          // Legacy XSS filter (defence-in-depth for old browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Allow DNS prefetch for performance
          { key: "X-DNS-Prefetch-Control", value: "on" },
          // Prevent cross-origin data leaks
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      {
        // Stricter cache control for API routes — never cache sensitive responses
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, private" },
          { key: "Pragma", value: "no-cache" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
