import type { Metadata } from "next";
import BannerSection from "@/components/home/BannerSection";
import HeroSection from "@/components/home/HeroSection";
import InfoSection from "@/components/home/InfoSection";
import NewsletterSection from "@/components/home/NewsletterSection";
import TeaTypesSection from "@/components/home/TeaTypeSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import TopSellersSection from "@/components/home/TopSellerSection";
import type { HeroBanner } from "@/components/home/HeroSection";
import type { Product } from "@/hooks/useTopSellerProducts";
import type { Testimonial } from "@/components/home/TestimonialsSection";
import { getPublicData } from "@/lib/serverData";

// Rebuild the cached homepage in the background at most every 5 minutes,
// so admin changes to banners/products show up within about 5 minutes.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Ledo Valley | Buy Premium Assam Tea Online",
  description:
    "Shop premium Assam tea online at Ledo Valley. Direct from the tea gardens of Assam since 1968. Black tea, green tea, organic tea — delivered fresh to your doorstep.",
  alternates: {
    canonical: "https://www.ledovalley.com",
  },
};

export default async function HomePage() {
  // Fetched on the server in parallel and cached (see lib/serverData.ts).
  const [heroBanners, topSellers, testimonials] = await Promise.all([
    getPublicData<HeroBanner[]>("/customer/home-banner"),
    getPublicData<{ products?: Product[] }>("/customer/products?sort=popular&limit=3"),
    getPublicData<Testimonial[]>("/admin/reviews/testimonials"),
  ]);

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Ledo Valley",
    url: "https://www.ledovalley.com",
    logo: "https://www.ledovalley.com/og-banner1.jpeg",
    description: "Premium Assam tea brand since 1968. Direct from Tinsukia, Assam.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-70990-38036",
      contactType: "customer service",
      availableLanguage: ["English", "Hindi", "Assamese"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Unit No. 7C Cosmo Plaza Market, AT Road",
      addressLocality: "Tinsukia",
      addressRegion: "Assam",
      postalCode: "786125",
      addressCountry: "IN",
    },
    sameAs: [],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Ledo Valley",
    url: "https://www.ledovalley.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.ledovalley.com/shop?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection initialBanners={Array.isArray(heroBanners) ? heroBanners : undefined} />
      <InfoSection />
      <TeaTypesSection />
      <TopSellersSection initialProducts={topSellers?.products} />
      <BannerSection />
      <TestimonialsSection initialTestimonials={Array.isArray(testimonials) ? testimonials : undefined} />
      <NewsletterSection />
    </>
  );
}
