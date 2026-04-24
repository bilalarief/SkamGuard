/**
 * Hero banner carousel with animated progress bar indicator.
 * Slides are mapped dynamically from data/heroSlides.
 *
 * Uses Swiper's native onAutoplayTimeLeft for infinite progress tracking.
 * Each slide can optionally link to an external URL.
 *
 * @module components/home/HeroSection
 */

"use client";

import { useState, useRef, useCallback } from "react";
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
  const swiperRef = useRef<SwiperType | null>(null);

  /** Track active slide index */
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  /**
   * Swiper's native autoplay progress callback.
   * Fires continuously while autoplay is running — inherently infinite.
   * `percentage` goes from 1 → 0 as the slide timer counts down.
   */
  const handleAutoplayTimeLeft = useCallback(
    (_swiper: SwiperType, _timeLeft: number, percentage: number) => {
      // percentage is 1 at start, 0 at end — invert to get 0→100%
      setProgress((1 - percentage) * 100);
    },
    []
  );

  /** Handle slide click → open external link */
  const handleSlideClick = useCallback((linkUrl?: string) => {
    if (linkUrl) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    }
  }, []);

  /**
   * Compute the fill width of each progress segment.
   * Past slides: fully filled. Active slide: animating. Future: empty.
   * When activeIndex wraps back to 0, all bars reset naturally.
   */
  const getBarWidth = (i: number): string => {
    if (i < activeIndex) return "100%";
    if (i === activeIndex) return `${progress}%`;
    return "0%";
  };

  return (
    <section className="w-full h-full relative">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: HERO_AUTOPLAY_DELAY,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
        loop
        speed={600}
        className="w-full h-full"
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        onSlideChange={handleSlideChange}
        onAutoplayTimeLeft={handleAutoplayTimeLeft}
      >
        {HERO_SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className={`relative w-full h-full bg-[#003B73] ${slide.linkUrl ? "cursor-pointer" : ""}`}
              onClick={() => handleSlideClick(slide.linkUrl)}
            >
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
              <div className="absolute bottom-20 left-0 right-0 px-6 max-w-[85%]">
                <span
                  className={`
                    inline-flex items-center self-start
                    ${slide.badgeColor} ${slide.badgeTextColor}
                    text-[10px] sm:text-[11px] md:text-xs font-bold uppercase tracking-wider
                    px-2.5 py-0.5 rounded-sm mb-3
                  `}
                >
                  {t(slide.badgeKey)}
                </span>
                <h3 className="text-white text-[22px] sm:text-[23px] md:text-2xl font-medium leading-tight mb-2 pr-8">
                  {t(slide.titleKey)}
                </h3>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Progress bar indicator */}
      <div className="absolute bottom-16 left-6 right-6 z-20 flex items-center gap-2 max-w-[100px]">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.id}
            className="relative h-[3px] flex-1 rounded-full overflow-hidden bg-white/25"
          >
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white transition-none"
              style={{ width: getBarWidth(i) }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}