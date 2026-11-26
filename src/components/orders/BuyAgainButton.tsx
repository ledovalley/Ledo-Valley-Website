"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

export interface ReorderItem {
  productId: string;
  variantId: string;
  productName: string;
  quantity: number;
  weight?: { value: number; unit: string };
}

/* Orders that were never paid have "Retry payment" instead. */
const NOT_FOR = ["PLACED", "PAYMENT_PENDING", "PAYMENT_FAILED"];

export const canBuyAgain = (status: string, items?: unknown[]) =>
  !NOT_FOR.includes(status) && !!items?.length;

/*
 * "Buy again": puts every item of a past order back in the cart (same pack
 * sizes and quantities, today's prices) and opens checkout. Items no longer
 * on sale or out of stock are skipped and listed.
 */
export default function BuyAgainButton({
  items,
  className = "",
  variant = "solid",
}: {
  items: ReorderItem[];
  className?: string;
  variant?: "solid" | "outline";
}) {
  const { addManyToCart } = useCart();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const buyAgain = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { added, failed } = await addManyToCart(
        items
          .filter((i) => i.productId && i.variantId)
          .map((i) => ({
            productId: String(i.productId),
            variantId: String(i.variantId),
            quantity: i.quantity,
            name: `${i.productName}${i.weight ? ` ${i.weight.value}${i.weight.unit}` : ""}`,
          }))
      );

      if (failed.length) {
        toast.warning(
          `${added ? "Added the rest. " : ""}Not available now: ${failed.map((f) => `${f.name} (${f.reason})`).join(", ")}`,
          { duration: 8000 }
        );
      }
      if (added) {
        if (!failed.length) toast.success("Added to your cart at today's prices");
        try {
          const w = window as unknown as { dataLayer?: unknown[] };
          w.dataLayer = w.dataLayer || [];
          w.dataLayer.push({ event: "buy_again", items_added: added });
        } catch {
          // analytics is optional
        }
        router.push("/checkout");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={buyAgain}
      disabled={busy}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition disabled:opacity-60 ${
        variant === "outline"
          ? "border border-neutral-300 bg-bg-surface text-neutral-700 hover:bg-neutral-50"
          : "bg-bg-dark text-white hover:bg-bg-dark/90"
      } ${className}`}
    >
      <RotateCcw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} aria-hidden="true" />
      {busy ? "Adding…" : "Buy again"}
    </button>
  );
}
