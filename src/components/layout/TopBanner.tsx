"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import api from "@/lib/api";
import { Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Banner {
  _id: string;
  message: string;
  couponCode?: string;
  visibility: "ALL" | "LOGGED_IN" | "LOGGED_OUT";
}

export default function TopBanner() {
  const { isLoggedIn } = useAuth();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await api.get("/customer/top-banner/banner");
        if (isMounted) setBanners(res.data || []);

        console.log("Fetched banners:", res.data);
      } catch (err) {
        console.error("Banner fetch failed:", err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ================= FILTER ================= */

  const visibleBanners = useMemo(() => {
    return banners.filter((banner) => {
      if (banner.visibility === "ALL") return true;
      if (banner.visibility === "LOGGED_IN") return isLoggedIn;
      if (banner.visibility === "LOGGED_OUT") return !isLoggedIn;
      return false;
    });
  }, [banners, isLoggedIn]);

  /* ================= SAFE INDEX ================= */

  const safeIndex =
    visibleBanners.length > 0
      ? currentIndex % visibleBanners.length
      : 0;

  /* ================= ROTATION ================= */

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (paused || visibleBanners.length < 2) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => prev + 1); // 🔥 no reset here
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [visibleBanners.length, paused]);

  /* ================= COPY ================= */

  const handleCopy = async (banner: Banner) => {
    if (!banner.couponCode) return;

    try {
      await navigator.clipboard.writeText(banner.couponCode);
      setCopiedId(banner._id);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  /* ================= EMPTY ================= */

  if (!visibleBanners.length) return null;

  /* ================= UI ================= */

  return (
    <div
      className="relative bg-bg-dark text-text-on-dark text-xs overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* SLIDER */}
      <div className="relative h-10 overflow-hidden">
        <div
          className="absolute inset-0 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateY(-${safeIndex * 100}%)`,
          }}
        >
          {visibleBanners.map((banner) => (
            <div
              key={banner._id}
              className="h-10 w-full flex items-center justify-center gap-3 px-4"
            >
              <span className="text-center whitespace-nowrap">
                {banner.message}
              </span>

              {banner.couponCode && (
                <button
                  onClick={() => handleCopy(banner)}
                  className="flex items-center gap-1 underline font-medium hover:opacity-80 cursor-pointer transition"
                >
                  {copiedId === banner._id ? (
                    <>
                      Copied <Check size={14} />
                    </>
                  ) : (
                    <>
                      {banner.couponCode}
                      <Copy size={14} />
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PROGRESS BAR */}
      {visibleBanners.length > 1 && !paused && (
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white/20">
          <div
            key={safeIndex}
            className="h-full bg-bg-page/20 animate-progress"
          />
        </div>
      )}
    </div>
  );
}