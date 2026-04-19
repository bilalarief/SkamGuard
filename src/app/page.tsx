import HeroSection from "@/components/home/HeroSection";
import FeatureCardList from "@/components/home/FeatureCardList";
import StatsSection from "@/components/home/StatsSection";
import AppFooter from "@/components/home/AppFooter";

export default function HomePage() {
  return (
    <div className="container-app py-8 space-y-10">
      <HeroSection />
      <FeatureCardList />
      <StatsSection />
      <AppFooter />
    </div>
  );
}
