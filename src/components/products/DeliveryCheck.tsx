"use client";

import { useEffect, useState } from "react";
import { MapPin, Truck, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/lib/api";

type Result =
  | { kind: "ok"; pincode: string; etaDays: number | null }
  | { kind: "post"; pincode: string }
  | { kind: "unknown"; pincode: string }
  | { kind: "error"; message: string };

const KEY = "ledo:pincode";

/* Ask the server whether couriers reach a pincode (cached on the server). */
export async function checkDelivery(pincode: string): Promise<Result> {
  try {
    const { data } = await api.get(`/public/delivery-check/${pincode}`);
    if (data.serviceable === true) return { kind: "ok", pincode, etaDays: data.etaDays ?? null };
    if (data.serviceable === false) return { kind: "post", pincode };
    return { kind: "unknown", pincode };
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
      "Couldn't check right now. We deliver across India.";
    return { kind: "error", message };
  }
}

export function DeliveryMessage({ result }: { result: Result }) {
  if (result.kind === "ok") {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0d4728]/6 border border-[#0d4728]/15 text-xs sm:text-sm text-[#0d4728]">
        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-[#0d4728]" />
        <span className="leading-relaxed">
          Delivers to <strong className="font-bold underline decoration-[#0d4728]/30">{result.pincode}</strong>
          {result.etaDays ? (
            <> in about <strong className="font-bold">{result.etaDays} day{result.etaDays === 1 ? "" : "s"}</strong> after dispatch</>
          ) : ""}. Orders packed & dispatched within 24 hours.
        </span>
      </div>
    );
  }
  if (result.kind === "post") {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900">
        <Truck className="h-4 w-4 shrink-0 mt-0.5 text-amber-700" />
        <span className="leading-relaxed">
          Delivers to <strong>{result.pincode}</strong> via <strong>India Post Speed Post</strong>. Usually takes a few extra days for remote delivery.
        </span>
      </div>
    );
  }
  if (result.kind === "unknown") {
    return (
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-700">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-gray-500" />
        <span>Couldn&apos;t verify <strong>{result.pincode}</strong> right now. We deliver across all India pincodes.</span>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-700">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
      <span>{result.message}</span>
    </div>
  );
}

/** Elegant pincode delivery estimation bar for product detail page */
export default function DeliveryCheck() {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (pin: string) => {
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setResult({ kind: "error", message: "Please enter a valid 6-digit pincode." });
      return;
    }
    setChecking(true);
    const r = await checkDelivery(pin);
    setResult(r);
    setChecking(false);
    if (r.kind !== "error") {
      try {
        localStorage.setItem(KEY, pin);
      } catch {
        // ignore
      }
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && /^[1-9]\d{5}$/.test(saved)) {
        setPincode(saved);
        run(saved);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-black/8 bg-bg-surface p-4 sm:p-5 shadow-2xs space-y-3">
      {/* Title & Input Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#0d4728]">
          <div className="w-7 h-7 rounded-full bg-[#0d4728]/10 flex items-center justify-center text-[#0d4728] shrink-0">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <span>Delivery Options</span>
        </div>

        {/* Unified Search Input with Inside Action Button */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            run(pincode);
          }}
          className="relative flex items-center w-full sm:w-64"
        >
          <input
            id="delivery-pincode"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            placeholder="Enter 6-digit Pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full h-10 pl-3.5 pr-20 rounded-full border border-black/15 bg-[#fbfbf7] text-xs sm:text-sm text-[#0F1111] placeholder:text-gray-400 outline-none focus:border-[#0d4728] focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={checking || pincode.length !== 6}
            className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-[#0d4728] text-white text-xs font-semibold cursor-pointer transition hover:bg-[#0a3820] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {checking ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              "Check"
            )}
          </button>
        </form>
      </div>

      {/* Result Status Message */}
      {result && (
        <div className="pt-1 animate-fadeIn" aria-live="polite">
          <DeliveryMessage result={result} />
        </div>
      )}
    </div>
  );
}
