"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "@/lib/api";

interface Banner {
  _id: string;
  image: {
    url: string;
  };
}

export default function ShopBanner() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  /* ================= FETCH ================= */

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(
          "/customer/shop-banner"
        );
        setBanners(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= ROTATION (ONLY IF MULTIPLE) ================= */

  useEffect(() => {
    if (banners.length <= 1) return; // ✅ No rotation

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
      setImageLoaded(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  if (loading) {
    return (
      <div className="w-full h-[96vh] bg-gray-200 animate-pulse" />
    );
  }

  if (!banners.length) return null;

  const shouldAnimate = banners.length > 1;

  return (
    <div className="w-full h-[72vh] relative overflow-hidden bg-gray-100">
      {!imageLoaded && shouldAnimate && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
      )}

      <Image
        src={banners[current].image.url}
        alt="Shop Banner"
        fill
        priority
        className={`object-cover ${shouldAnimate
            ? `transition-opacity duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
            }`
            : "opacity-100"
          }`}
        onLoadingComplete={() => setImageLoaded(true)}
      />
    </div>
  );
}
