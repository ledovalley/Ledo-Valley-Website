"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "@/lib/api";

interface Banner {
  _id: string;
  image: {
    url: string;
  };
  mobileImage?: {
    url: string;
  };
}

export default function ShopBanner({ teaType }: { teaType?: string | null }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
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
  }, [teaType]);

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
            srcSet={currentBanner.mobileImage.url}
          />
        )}
        <Image
          src={currentBanner.image.url}
          alt="Shop Banner"
          fill
          priority
          onLoadingComplete={() => setImageLoaded(true)}
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
