"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/gtm";

export default function RouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousUrl = useRef<string>("");

  useEffect(() => {
    // Construct the current URL
    const search = searchParams?.toString();
    const currentUrl = search ? `${pathname}?${search}` : pathname;

    // Track the page view after a short delay to ensure title is updated
    const timeoutId = setTimeout(() => {
      trackPageView({
        location: window.location.href,
        referrer: previousUrl.current || document.referrer,
      });

      // Update the previous URL for the next navigation
      previousUrl.current = window.location.href;
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname, searchParams]);

  return null;
}
