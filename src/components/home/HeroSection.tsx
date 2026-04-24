/**
 * Hero banner carousel with animated progress bar indicator.
 * Slides are mapped dynamically from data/heroSlides.
 *
 * Uses next/image for optimized image loading.
 *
 * @module components/home/HeroSection
 */

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useLanguage } from "@/hooks/useLanguage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { HERO_SLIDES, HERO_AUTOPLAY_DELAY } from "@/data/heroSlides";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";

export default function HeroSection() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const totalSlides = HERO_SLIDES.length;

  /** Start the progress bar animation for the current slide */
  const startProgress = useCallback(() => {
    // Cancel any running animation
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setProgress(0);
    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min((elapsed / HERO_AUTOPLAY_DELAY) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, []);

  /** Restart progress on slide change */
  const handleSlideChange = useCallback(
    (swiper: SwiperType) => {
      setActiveIndex(swiper.realIndex);
      startProgress();
    },
    [startProgress]
  );

  /** Start progress on mount */
  useEffect(() => {
    startProgress();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [startProgress]);

  return (
    <section className="w-full h-full relative">
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: HERO_AUTOPLAY_DELAY, disableOnInteraction: false }}
        loop
        className="w-full h-full"
        onSlideChange={handleSlideChange}
      >
        {HERO_SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full bg-[#003B73]">
              {/* Banner image — fills entire slide */}
              <Image
                src={slide.imageSrc}
                alt={slide.imageAlt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={slide.id === "slide-1"}
              />

              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#022d52] via-[#022d52]/30 to-transparent" />

              {/* Text content */}
              <div className="absolute bottom-16 left-0 right-0 px-6 max-w-[85%]">
                <span
                  className={`
                    inline-flex items-center self-start
                    ${slide.badgeColor} ${slide.badgeTextColor}
                    text-[10px] font-bold uppercase tracking-wider
                    px-2.5 py-0.5 rounded-sm mb-3
                  `}
                >
                  {t(slide.badgeKey)}
                </span>
                <h3 className="text-white text-[22px] font-medium leading-tight mb-2 pr-8">
                  {t(slide.titleKey)}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Progress bar indicator */}
      <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center gap-2">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="relative h-[3px] flex-1 rounded-full overflow-hidden bg-white/25"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white transition-none"
              style={{
                width:
                  i < activeIndex
                    ? "100%"       // Past slides: filled
                    : i === activeIndex
                    ? `${progress}%` // Active slide: animating
                    : "0%",         // Future slides: empty
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}