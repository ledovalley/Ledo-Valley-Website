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
    <div className="px-4 py-3 rounded-2xl bg-bg-surface" role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-sm text-text-primary">
        <Truck size={16} aria-hidden="true" className="shrink-0" />
        {reached ? (
          <span>
            <strong>You&apos;ve got free delivery!</strong>
          </span>
        ) : (
          <span>
            Add <strong>{inr(remaining)}</strong> more for <strong>free delivery</strong>
            <span className="text-text-secondary"> (otherwise {inr(charge)})</span>
          </span>
        )}
      </p>
      <div
        className="h-1.5 mt-2 overflow-hidden rounded-full bg-black/10"
        aria-hidden="true"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${reached ? "bg-green-600" : "bg-bg-dark"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
