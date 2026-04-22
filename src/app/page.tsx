import HeroSection from "@/components/home/HeroSection";
import FeatureCardList from "@/components/home/FeatureCardList";
import StatsSection from "@/components/home/StatsSection";
import AppFooter from "@/components/home/AppFooter";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-surface">
      {/* Top Banner Area - negative margin to go under the fixed header (h-14 = 56px) */}
      <div className="-mt-14 h-[420px] relative w-full">
         <HeroSection />
      </div>

      {/* White Container wrapping the rest */}
      <div className="flex-1 bg-[#F8FAFC] rounded-t-[32px] -mt-6 relative z-10 px-5 pt-8 pb-6 space-y-6 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container-app">
          <div className="mb-4">
            <StatsSection/>
          </div>
          <FeatureCardList />
          <AppFooter />
        </div>
      </div>
    </div>
  );
}
