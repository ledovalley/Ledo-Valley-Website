"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "@/lib/api";
import { cloudinaryResized } from "@/lib/cloudinary";

export interface HeroBanner {
  _id: string;
  image: { url: string };
  mobileImage?: { url: string };
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

type Banner = HeroBanner;

/*
 * initialBanners comes from the server (cached), so the first banner shows
 * immediately. If the server couldn't get them, the browser fetches them.
 */
export default function HeroSection({ initialBanners }: { initialBanners?: Banner[] }) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners ?? []);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(!initialBanners);
  // The first banner is shown straight away; later slides fade in once loaded.
  const [imageLoaded, setImageLoaded] = useState(true);

  useEffect(() => {
    if (initialBanners) return;
    const load = async () => {
      try {
        const { data } = await axios.get("/customer/home-banner");
        setBanners(data);
      } catch (err) {
        console.error("HERO ERROR:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [initialBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
      setImageLoaded(false);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return <div className="h-[94vh] sm:h-[96vh] bg-bg-surface animate-pulse" />;
  }

  if (!banners.length) return null;

  const b = banners[current];
  const hasMultiple = banners.length > 1;

  return (
    <section className="relative h-[94vh] sm:h-[96vh] overflow-hidden">
      {/* Background Image Container */}
      <div className="absolute inset-0">
        <picture>
          {b.mobileImage?.url && (
            <source
              media="(max-width: 640px)"
              // Phone-sized, compressed copy instead of the full original.
              srcSet={cloudinaryResized(b.mobileImage.url, 828)}
            />
          )}
          <Image
            src={b.image.url}
            alt={b.title || "Hero Banner"}
            fill
            // First banner: fetch it first and don't wait to load it.
            fetchPriority={current === 0 ? "high" : "auto"}
            loading={current === 0 ? "eager" : "lazy"}
            sizes="100vw"
            quality={70}
            onLoad={() => setImageLoaded(true)}
            className={`object-cover transition-opacity duration-1000 ${imageLoaded ? "opacity-100" : "opacity-0"
              }`}
          />
        </picture>
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Wrapper */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center md:justify-end md:pb-24"
      >
        <div className={`w-full transition-all duration-700 delay-300 ${imageLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
          <h1
            className="
              font-playfair
              text-(--color-text-on-dark)
              text-4xl sm:text-5xl md:text-6xl
              mb-4 font-semibold
              leading-tight
              capitalize
            "
          >
            {b.title || "Brewed for your everyday moments"}
          </h1>

          <p
            className="
              text-lg sm:text-xl font-medium
              text-(--color-text-on-dark)/90
              mx-auto max-w-2xl
            "
          >
            {b.subtitle || "Crafted from the finest Assam tea leaves"}
          </p>

          {/* Every banner gets a button; set your own text/link in the admin's Home Banners. */}
          <div className="mt-8">
            <Link
              href={b.buttonLink || "/shop"}
              className="inline-flex items-center justify-center rounded-full bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
            >
              {b.buttonText || "Shop now"}
            </Link>
          </div>
        </div>

        {/* Carousel Indicators */}
        {hasMultiple && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Show banner ${idx + 1} of ${banners.length}`}
                onClick={() => {
                  setCurrent(idx);
                  setImageLoaded(false);
                }}
                className={`h-1.5 transition-all duration-300 rounded-full ${idx === current ? "w-8 bg-brand-primary" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}