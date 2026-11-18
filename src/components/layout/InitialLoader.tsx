"use client";

import { useState, useEffect } from "react";
import Loading from "@/app/loading";

/*
 * Brand splash on the first visit of a session.
 *
 * The page itself is always rendered underneath, so search engines, link
 * previews and visitors on slow phones get the real content straight away
 * (before, the whole site was replaced by the splash for 2.5 seconds and the
 * server sent no page content at all).
 *
 * Set SPLASH_MS to 0 to switch the splash off entirely.
 */
const SPLASH_MS = 1000;
const FADE_MS = 400;
const SEEN_KEY = "lv_initial_loaded";

export default function InitialLoader({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(SPLASH_MS > 0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = !!sessionStorage.getItem(SEEN_KEY);
      sessionStorage.setItem(SEEN_KEY, "true");
    } catch {
      // storage unavailable: show the splash once per page load
    }

    if (seen || SPLASH_MS <= 0) {
      setShowSplash(false);
      return;
    }

    const fadeTimer = setTimeout(() => setFading(true), SPLASH_MS);
    const hideTimer = setTimeout(() => setShowSplash(false), SPLASH_MS + FADE_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {children}
      {showSplash && (
        <div
          id="lv-splash"
          aria-hidden="true"
          className={`transition-opacity ${fading ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          style={{ transitionDuration: `${FADE_MS}ms` }}
        >
          <Loading />
        </div>
      )}
      {/* Without JavaScript the splash would never hide. */}
      <noscript>
        <style>{"#lv-splash{display:none}"}</style>
      </noscript>
    </>
  );
}
