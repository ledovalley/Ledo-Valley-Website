import BannerSection from "@/components/home/BannerSection";
import HeroSection from "@/components/home/HeroSection";
import InfoSection from "@/components/home/InfoSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import TeaTypesSection from "@/components/home/TeaTypeSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TopSellersSection from "@/components/home/TopSellerSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <InfoSection />
      <TeaTypesSection />
      <TopSellersSection />
      <BannerSection />
      <TestimonialsSection />
      <NewsletterSection />
    </>
  );
}
