/**
 * Hero banner carousel — Swiper replaced with framer-motion.
 *
 * Features:
 *   - Auto-advance with configurable delay (setInterval-based, cross-browser)
 *   - Smooth slide transition (AnimatePresence)
 *   - Touch/drag swipe support (dragConstraints)
 *   - Animated progress bar per slide
 *   - External link on tap
 *   - Pause on hover (desktop only)
 *   - Responsive images (mobile vs desktop)
 *
 * @module components/home/HeroSection
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { m, AnimatePresence, type Transition } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { HERO_SLIDES, HERO_AUTOPLAY_DELAY } from "@/data/heroSlides";

export default function HeroSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragDirection, setDragDirection] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const totalSlides = HERO_SLIDES.length;

  // ─── Detect desktop via matchMedia ──────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsDesktop(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ─── Navigation helpers ─────────────────────────────────────

  const advance = useCallback(() => {
    setDragDirection(-1);
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goTo = useCallback((index: number, dir: number) => {
    setDragDirection(dir);
    setActiveIndex(index);
  }, []);

  const goNext = useCallback(() => {
    setDragDirection(-1);
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setDragDirection(1);
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // ─── Autoplay (setInterval — rock-solid cross-browser) ──────

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      advance();
    }, HERO_AUTOPLAY_DELAY);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, advance]);

  // ─── Progress bar animation (RAF) ───────────────────────────

  useEffect(() => {
    // Cancel previous RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (isPaused) {
      // Keep progress frozen while paused
      return;
    }

    // Reset progress on slide change
    setProgress(0);
    let start = 0;

    const tick = (ts: number) => {
      if (start === 0) start = ts;
      const pct = Math.min(((ts - start) / HERO_AUTOPLAY_DELAY) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [activeIndex, isPaused]);

  // ─── Touch/drag ───────────────────────────────────────────────

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -50) goNext();
      else if (info.offset.x > 50) goPrev();
      setIsPaused(false);
    },
    [goNext, goPrev]
  );

  // ─── Slide animation variants ─────────────────────────────────

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  const transition: Transition = {
    duration: 0.45,
    ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
  };

  const activeSlide = HERO_SLIDES[activeIndex];
  const desktopSrc = activeSlide.desktopImageSrc || activeSlide.imageSrc;

  return (
    <section
      className="w-full h-full relative overflow-hidden md:rounded-2xl"
      role="region"
      aria-label="Scam awareness carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Slide layer ─── */}
      <AnimatePresence initial={false} custom={dragDirection} mode="wait">
        <m.div
          key={activeSlide.id}
          custom={dragDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          className="absolute inset-0"
          aria-roledescription="slide"
          aria-label={`Slide ${activeIndex + 1} of ${totalSlides}`}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className={`relative w-full h-full bg-[#003B73] ${activeSlide.linkUrl ? "cursor-pointer" : ""}`}
            onClick={() => {
              if (activeSlide.linkUrl) {
                window.open(activeSlide.linkUrl, "_blank", "noopener,noreferrer");
              }
            }}
          >
            {/* Banner image — src switches via JS matchMedia */}
            <Image
              src={isDesktop ? desktopSrc : activeSlide.imageSrc}
              alt={activeSlide.imageAlt}
              fill
              className="object-cover"
              sizes={isDesktop ? "1280px" : "100vw"}
              priority={activeIndex === 0}
              draggable={false}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#022d52] via-[#022d52]/30 to-transparent" />

            {/* Text content */}
            <div className="absolute bottom-20 left-0 right-0 px-6 max-w-[85%] md:max-w-[60%]">
              <span
                className={`
                  inline-flex items-center self-start
                  ${activeSlide.badgeColor} ${activeSlide.badgeTextColor}
                  text-[10px] sm:text-[11px] font-bold uppercase tracking-wider
                  px-2.5 py-0.5 rounded-sm mb-3
                `}
              >
                {t(activeSlide.badgeKey)}
              </span>
              <h3 className="text-white text-[22px] sm:text-[23px] font-medium leading-tight mb-2 pr-8">
                {t(activeSlide.titleKey)}
              </h3>
            </div>
          </div>
        </m.div>
      </AnimatePresence>

      {/* ─── Progress bar indicators ─── */}
      <div
        className="absolute bottom-16 left-6 z-20 flex items-center gap-2 max-w-[100px]"
        role="tablist"
        aria-label="Slides"
      >
        {HERO_SLIDES.map((slide, i) => {
          const isActive = i === activeIndex;
          const isComplete = i < activeIndex;

          return (
            <button
              key={slide.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i, i > activeIndex ? -1 : 1)}
              className="relative h-[3px] flex-1 rounded-full overflow-hidden bg-white/25 cursor-pointer min-w-[24px]"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white transition-none"
                style={{
                  width: isComplete ? "100%" : isActive ? `${progress}%` : "0%",
                }}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}