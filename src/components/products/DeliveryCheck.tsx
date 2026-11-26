"use client";

import { useEffect, useState } from "react";
import { MapPin, Truck, Loader2 } from "lucide-react";
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
      <p className="flex items-start gap-2 text-sm text-green-800">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Delivers to <strong>{result.pincode}</strong>
          {result.etaDays ? <> in about <strong>{result.etaDays} day{result.etaDays === 1 ? "" : "s"}</strong> after dispatch</> : ""}.
          We pack orders within 24 hours.
        </span>
      </p>
    );
  }
  if (result.kind === "post") {
    return (
      <p className="flex items-start gap-2 text-sm text-amber-800">
        <Truck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          We deliver to <strong>{result.pincode}</strong> by India Post Speed Post. It can take a few days longer than usual.
        </span>
      </p>
    );
  }
  if (result.kind === "unknown") {
    return <p className="text-sm text-gray-600">Couldn&apos;t check {result.pincode} right now. We deliver across India.</p>;
  }
  return <p className="text-sm text-red-600">{result.message}</p>;
}

/** "Check delivery" box for the product page. Remembers the last pincode. */
export default function DeliveryCheck() {
  const [pincode, setPincode] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (pin: string) => {
    if (!/^[1-9]\d{5}$/.test(pin)) {
      setResult({ kind: "error", message: "Please enter a 6-digit pincode." });
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
    <div className="mt-6 rounded-2xl border border-border-muted/30 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(pincode);
        }}
        className="flex items-center gap-2"
      >
        <label htmlFor="delivery-pincode" className="flex shrink-0 items-center gap-1.5 text-sm font-medium">
          <MapPin className="h-4 w-4" /> Check delivery
        </label>
        <input
          id="delivery-pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-28 min-w-0 flex-1 rounded-full border border-border-muted/40 px-4 py-2 text-sm outline-none focus:border-bg-dark"
        />
        <button
          type="submit"
          disabled={checking || pincode.length !== 6}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-bg-dark px-4 py-2 text-sm font-medium transition hover:bg-bg-dark hover:text-white disabled:opacity-40"
        >
          {checking && <Loader2 className="h-4 w-4 animate-spin" />}
          Check
        </button>
      </form>
      {result && (
        <div className="mt-3" aria-live="polite">
          <DeliveryMessage result={result} />
        </div>
      )}
    </div>
  );
}
