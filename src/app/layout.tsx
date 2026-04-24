import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DesktopAlert from "@/components/layout/DesktopAlert";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://skamguard-710868323753.asia-southeast1.run.app";

export const metadata: Metadata = {
  title: {
    default: "SkamGuard — Malaysia's Real-Time AI Scam Defense",
    template: "%s | SkamGuard",
  },
  description:
    "Detect scams instantly. Upload a screenshot or paste a suspicious message — " +
    "SkamGuard's Gemini AI analyzes URLs, phone numbers, and content in real-time to protect Malaysians from fraud.",
  keywords: [
    "scam", "penipuan", "Malaysia", "SkamGuard", "scam checker",
    "anti scam", "fraud detection", "Gemini AI", "real-time",
    "phishing", "Macau scam", "investment scam", "online safety",
  ],
  authors: [{ name: "SkamGuard Team" }],
  creator: "SkamGuard",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "ms_MY",
    alternateLocale: "en_US",
    url: SITE_URL,
    siteName: "SkamGuard",
    title: "SkamGuard — Malaysia's Real-Time AI Scam Defense",
    description:
      "Upload a screenshot or paste a message. Powered by Gemini AI to detect scams, phishing links, and fraud in real-time.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkamGuard — Malaysia's AI Scam Defense Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkamGuard — AI Scam Defense for Malaysia",
    description: "Detect scams instantly with Gemini AI. Protect yourself from fraud.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#1B4965",
  width: "device-width",
  initialScale: 1,
};

/** JSON-LD structured data for search engines */
function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SkamGuard",
    description: "Malaysia's Real-Time AI Scam Defense Companion. Powered by Gemini AI.",
    url: SITE_URL,
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MYR",
    },
    author: {
      "@type": "Organization",
      name: "SkamGuard Team",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <JsonLd />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0F172A]`}>
        <LanguageProvider>
          <AuthProvider>
            {/* Smartphone alert — only visible on lg+ screens */}
            <DesktopAlert />

            {/* App shell — responsive up to tablet, centered on larger screens */}
            <div className="max-w-[768px] mx-auto min-h-screen bg-bg relative shadow-2xl overflow-x-hidden">
              <Header />
              <main className="pt-14 pb-20 min-h-screen">
                {children}
              </main>
              <BottomNav />
            </div>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}

