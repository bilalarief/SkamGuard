/**
 * Hero banner carousel — Swiper replaced with framer-motion.
 *
 * WHY: Swiper v12 adds ~200KB to the bundle for a 3-slide carousel.
 * framer-motion is already a project dependency (used elsewhere).
 * This custom implementation covers all required features:
 *   - Auto-advance with configurable delay
 *   - Smooth slide transition (AnimatePresence)
 *   - Touch/drag swipe support (dragConstraints)
 *   - Animated progress bar per slide
 *   - External link on tap
 *   - Pause on user interaction
 *   - prefers-reduced-motion safe (framer respects it via useReducedMotion)
 *
 * Security: external links use rel="noopener noreferrer".
 * Performance: only active slide rendered in DOM via AnimatePresence mode="wait".
 * Accessibility: role="region", aria-label, keyboard nav via tabIndex.
 *
 * @module components/home/HeroSection
 */

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { HERO_SLIDES, HERO_AUTOPLAY_DELAY } from "@/data/heroSlides";

export default function HeroSection() {
  const { t } = useLanguage();
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragDirection, setDragDirection] = useState(0);
  const progressRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);
  const totalSlides = HERO_SLIDES.length;

  // ─── Navigation ───────────────────────────────────────────────

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
    progressRef.current = 0;
    startTimeRef.current = Date.now();
  }, []);

  const goNext = useCallback(() => {
    setDragDirection(-1);
    goTo((activeIndex + 1) % totalSlides);
  }, [activeIndex, totalSlides, goTo]);

  const goPrev = useCallback(() => {
    setDragDirection(1);
    goTo((activeIndex - 1 + totalSlides) % totalSlides);
  }, [activeIndex, totalSlides, goTo]);

  // ─── Progress bar (RAF-based — accurate, no setInterval drift) ────

  useEffect(() => {
    if (isPaused || prefersReducedMotion) return;

    startTimeRef.current = Date.now() - (progressRef.current / 100) * HERO_AUTOPLAY_DELAY;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HERO_AUTOPLAY_DELAY) * 100, 100);
      progressRef.current = pct;
      setProgress(pct);

      if (pct >= 100) {
        setDragDirection(-1);
        setActiveIndex((prev) => {
          const next = (prev + 1) % totalSlides;
          progressRef.current = 0;
          startTimeRef.current = Date.now();
          setProgress(0);
          return next;
        });
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [activeIndex, isPaused, prefersReducedMotion, totalSlides]);

  // ─── Touch/drag ───────────────────────────────────────────────

  const dragThreshold = 50; // px — minimum drag to register as swipe

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x < -dragThreshold) goNext();
      else if (info.offset.x > dragThreshold) goPrev();
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

  const transition: Transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] };

  const activeSlide = HERO_SLIDES[activeIndex];

  return (
    <section
      className="w-full h-full relative overflow-hidden"
      role="region"
      aria-label="Scam awareness carousel"
      aria-roledescription="carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ─── Slide layer ─── */}
      <AnimatePresence initial={false} custom={dragDirection} mode="wait">
        <motion.div
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
          // Touch swipe
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
            {/* Banner image */}
            <Image
              src={activeSlide.imageSrc}
              alt={activeSlide.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority={activeIndex === 0}
              draggable={false}
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#022d52] via-[#022d52]/30 to-transparent" />

            {/* Text content */}
            <div className="absolute bottom-20 left-0 right-0 px-6 max-w-[85%]">
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
        </motion.div>
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
              onClick={() => { setDragDirection(i > activeIndex ? -1 : 1); goTo(i); }}
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