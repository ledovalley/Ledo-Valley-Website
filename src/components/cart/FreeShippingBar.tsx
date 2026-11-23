"use client";

import { Truck } from "lucide-react";
import { useShippingRules } from "@/lib/useShippingRules";

const inr = (n: number) => `₹${Math.ceil(n).toLocaleString("en-IN")}`;

/*
 * "Add ₹240 more for free delivery" with a progress bar.
 * Uses the free-shipping amount set in the admin (Settings), so it always
 * matches what checkout charges. Hidden until that setting is known, and
 * when free shipping is switched off (threshold 0 or no shipping charge).
 */
export default function FreeShippingBar({ itemsTotal }: { itemsTotal: number }) {
  const rules = useShippingRules();
  if (!rules) return null;

  const { freeShippingThreshold: threshold, flatShippingCharge: charge } = rules;
  if (!(threshold > 0) || !(charge > 0)) return null;

  const remaining = Math.max(0, threshold - itemsTotal);
  const reached = remaining <= 0;
  const percent = Math.min(100, Math.round((itemsTotal / threshold) * 100));

  return (
    <div
      className="p-3.5 rounded-2xl bg-bg-surface border border-black/8 shadow-xs space-y-2.5"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-text-primary font-medium">
          <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <Truck size={13} aria-hidden="true" />
          </div>

          {reached ? (
            <span className="font-semibold text-green-700">
              Unlocked Free Delivery! 🎉
            </span>
          ) : (
            <span>
              Add <strong className="text-brand-primary font-bold">{inr(remaining)}</strong> more for <strong className="font-semibold">Free Delivery</strong>
            </span>
          )}
        </div>

        <span className="text-2xs font-semibold text-text-secondary bg-black/5 px-2 py-0.5 rounded-md shrink-0">
          {reached ? "100%" : `${percent}%`}
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-black/6"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${reached
              ? "bg-green-600"
              : "bg-gradient-to-r from-brand-primary/80 to-brand-primary"
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
