"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "@/lib/api";
import { cloudinaryResized } from "@/lib/cloudinary";

export interface ShopBannerData {
  _id: string;
  image: {
    url: string;
  };
  mobileImage?: {
    url: string;
  };
}

type Banner = ShopBannerData;

/*
 * initialBanners: the default (no tea type) banners from the server, cached,
 * so the shop banner shows immediately. Tea-type pages still fetch their own.
 */
export default function ShopBanner({
  teaType,
  initialBanners,
}: {
  teaType?: string | null;
  initialBanners?: Banner[];
}) {
  const useInitial = !teaType && !!initialBanners;
  const [banners, setBanners] = useState<Banner[]>(useInitial ? initialBanners! : []);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(!useInitial);
  const [imageLoaded, setImageLoaded] = useState(useInitial);

  /* ================= FETCH ================= */

  useEffect(() => {
    if (!teaType && initialBanners) {
      setBanners(initialBanners);
      setCurrent(0);
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(
          "/customer/shop-banner",
          { params: { teaType } }
        );
        setBanners(data);
        setCurrent(0); // Reset to first banner on teaType change
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [teaType, initialBanners]);

  /* ================= ROTATION (ONLY IF MULTIPLE) ================= */

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
      setImageLoaded(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="w-full h-[40vh] sm:h-[72vh] bg-gray-200 animate-pulse" />
    );
  }

  if (!banners.length) return null;

  const shouldAnimate = banners.length > 1;
  const currentBanner = banners[current];

  return (
    <div className="w-full h-[50vh] sm:h-[72vh] relative overflow-hidden bg-gray-100">
      {!imageLoaded && shouldAnimate && (
        <div className="absolute inset-0 z-10 bg-gray-200 animate-pulse" />
      )}

      {/* Responsive Picture Logic */}
      <picture>
        {currentBanner.mobileImage?.url && (
          <source
            media="(max-width: 640px)"
            srcSet={cloudinaryResized(currentBanner.mobileImage.url, 828)}
          />
        )}
        <Image
          src={currentBanner.image.url}
          alt="Shop Banner"
          fill
          // First banner: fetch it first and don't wait to load it.
          fetchPriority={current === 0 ? "high" : "auto"}
          loading={current === 0 ? "eager" : "lazy"}
          sizes="100vw"
          quality={70}
          onLoad={() => setImageLoaded(true)}
          className={`object-cover ${shouldAnimate
            ? `transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`
            : "opacity-100"
            }`}
        />
      </picture>
    </div>
  );
}
