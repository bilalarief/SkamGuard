/**
 * Home page — Server Component.
 *
 * P4 optimization: removed "use client" from page level.
 * framer-motion animations isolated to HomeAnimatedShell (Client Component).
 * HeroSection is also "use client" but Next.js handles that boundary correctly.
 *
 * Benefits:
 * - Full page HTML rendered server-side → faster FCP + better SEO
 * - Initial JS bundle for this route reduced (no framer on page level)
 * - Suspense boundary still provides loading skeleton fallback
 *
 * @module app/page
 */

import { Suspense } from "react";
import HeroSection from "@/components/home/HeroSection";
import HomeAnimatedShell from "@/components/home/HomeAnimatedShell";
import { HomePageSkeleton } from "@/components/shared/Skeleton";

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <div className="w-full flex flex-col min-h-screen bg-surface">
        {/* Hero banner — client component (carousel state) */}
        <div className="-mt-14 h-[440px] relative w-full overflow-hidden">
          <HeroSection />
        </div>

        {/* Animated content sections — client component (framer-motion) */}
        <HomeAnimatedShell />
      </div>
    </Suspense>
  );
}
