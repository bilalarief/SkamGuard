"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

export default function HeroSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full h-full relative">
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="w-full h-full"
      >
        <SwiperSlide>
          <div className="relative w-full h-full bg-[#003B73]">
            <img
              src="/banner1.jpg"
              className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
              alt="Scam news"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#022d52] via-transparent to-transparent" />
            {/* Content overlay */}
            <div className="absolute bottom-16 left-0 right-0 px-6 max-w-[85%]">
              <span className="inline-flex items-center self-start bg-white text-[#003B73] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-3">
                News
              </span>
              <h3 className="text-white text-[22px] font-medium leading-tight mb-2 pr-8">
                Police: RM1.47 Billion Lost To Investment Scams Last Year
              </h3>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full bg-[#003B73] flex items-center px-6 pt-10">
            <div className="max-w-[85%]">
              <span className="inline-flex items-center self-start bg-white text-[#003B73] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-3">
                Alert
              </span>
              <h3 className="text-white text-[22px] font-medium leading-tight mb-2 pr-8">
                Stay Vigilant Against Online Scams
              </h3>
            </div>
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="relative w-full h-full bg-[#002f5a] flex items-center px-6 pt-10">
            <div className="max-w-[85%]">
              <span className="inline-flex items-center self-start bg-white text-[#003B73] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-3">
                Tip
              </span>
              <h3 className="text-white text-[22px] font-medium leading-tight mb-2 pr-8">
                Use SkamGuard to Verify Suspicious Messages
              </h3>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>

      {/* Custom Swiper pagination styling */}
      <style jsx global>{`
        .swiper-pagination {
          bottom: 32px !important;
          text-align: left !important;
          padding-left: 24px;
        }

        .swiper-pagination-bullet {
          width: 16px;
          height: 4px;
          background: rgba(255, 255, 255, 0.4);
          opacity: 1;
          border-radius: 2px;
          margin: 0 4px !important;
          transition: all 0.3s ease;
        }

        .swiper-pagination-bullet-active {
          width: 24px;
          background: #00A3FF;
        }
      `}</style>
    </section>
  );
}