"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/loading";

export default function InitialLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we've already shown the loader in this session
    const hasLoaded = sessionStorage.getItem("lv_initial_loaded");

    if (hasLoaded) {
      // Use a timeout of 0 to move the update to the next tick,
      // avoiding synchronous cascading renders in the effect body.
      const bailTimer = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(bailTimer);
    }

    // Force show loader for at least 2.5 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      sessionStorage.setItem("lv_initial_loaded", "true");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}
