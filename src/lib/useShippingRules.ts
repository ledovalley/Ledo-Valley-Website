"use client";

import { useEffect, useState } from "react";

export interface ShippingRules {
  freeShippingThreshold: number;
  flatShippingCharge: number;
}

const CACHE_KEY = "lv_shipping_rules";
let memory: ShippingRules | null = null;
let inflight: Promise<ShippingRules | null> | null = null;

const readCache = (): ShippingRules | null => {
  if (memory) return memory;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) memory = JSON.parse(raw);
  } catch {
    // storage blocked: just fetch
  }
  return memory;
};

const load = () => {
  if (!inflight) {
    // Plain fetch, not the api client: this is optional, so a slow or failed
    // request must not show the "server waking up" screen or an error toast.
    inflight = fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/settings`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const threshold = Number(data?.freeShippingThreshold);
        if (!data || !Number.isFinite(threshold)) return null;
        memory = {
          freeShippingThreshold: threshold,
          flatShippingCharge: Number(data.flatShippingCharge) || 0,
        };
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(memory));
        } catch {
          // ignore
        }
        return memory;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/* The shop's shipping rules from the backend settings (same numbers checkout uses). */
export function useShippingRules(): ShippingRules | null {
  const [rules, setRules] = useState<ShippingRules | null>(null);

  useEffect(() => {
    let alive = true;
    const cached = readCache();
    if (cached) setRules(cached);
    load().then((fresh) => {
      if (alive && fresh) setRules(fresh);
    });
    return () => {
      alive = false;
    };
  }, []);

  return rules;
}
