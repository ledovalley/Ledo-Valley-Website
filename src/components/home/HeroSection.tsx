"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "@/lib/api";

interface Banner {
  _id: string;
  image: { url: string };
  mobileImage?: { url: string };
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function HeroSection() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
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
  }, []);

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
              srcSet={b.mobileImage.url}
            />
          )}
          <Image
            src={b.image.url}
            alt={b.title || "Hero Banner"}
            fill
            priority
            onLoadingComplete={() => setImageLoaded(true)}
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

          {(b.buttonText && b.buttonLink) && (
            <div className="mt-8">
              <Link
                href={b.buttonLink}
                className="inline-flex items-center justify-center rounded-full bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
              >
                {b.buttonText}
              </Link>
            </div>
          )}
        </div>

        {/* Carousel Indicators */}
        {hasMultiple && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
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