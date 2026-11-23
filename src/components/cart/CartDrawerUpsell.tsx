"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Check, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";

interface UpsellProduct {
  _id: string;
  name: string;
  slug: string;
  variantId: string;
  price: number;
  weightLabel: string;
  image: string;
}

export default function CartDrawerUpsell() {
  const { cart, addToCart } = useCart();
  const [recommendation, setRecommendation] = useState<UpsellProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUpsellItem() {
      try {
        setLoading(true);
        const res = await api.get("/customer/products", {
          params: { sort: "popular", limit: 6 },
        });

        const products: any[] = res.data?.products || [];
        if (products.length === 0) return;

        const cartVariantIds = new Set(cart.map((c) => c.variantId));

        for (const p of products) {
          const availableVariant = p.variants?.find(
            (v: any) => v.stock > 0 && !cartVariantIds.has(v._id)
          );

          if (availableVariant) {
            if (!cancelled) {
              setRecommendation({
                _id: p._id,
                name: p.name,
                slug: p.slug,
                variantId: availableVariant._id,
                price: availableVariant.finalPrice || availableVariant.sellingPrice,
                weightLabel: `${availableVariant.weight.value}${availableVariant.weight.unit}`,
                image: availableVariant.images?.[0]?.url || "/placeholder.png",
              });
              setAdded(false);
            }
            return;
          }
        }

        if (!cancelled) {
          setRecommendation(null);
        }
      } catch {
        // Silently fail if network drops
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUpsellItem();

    return () => {
      cancelled = true;
    };
  }, [cart]);

  if (loading || !recommendation) return null;

  const handleAdd = async () => {
    if (adding || added) return;
    try {
      setAdding(true);
      await addToCart({
        productId: recommendation._id,
        variantId: recommendation.variantId,
        name: recommendation.name,
        slug: recommendation.slug,
        image: recommendation.image,
        weightLabel: recommendation.weightLabel,
        quantity: 1,
        priceAtAdd: recommendation.price,
      });
      setAdded(true);
    } catch {
      // handled
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-bg-surface border border-black/8 shadow-xs">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
          <span className="text-xs font-semibold text-text-primary">
            Pair with your tea
          </span>
        </div>
        <span className="text-xs font-medium text-text-secondary bg-black/5 px-2 py-0.5 rounded-md">
          Recommended
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-13 h-13 rounded-xl overflow-hidden bg-bg-surface shrink-0 border border-black/5 p-1">
          <Image
            src={recommendation.image}
            alt={recommendation.name}
            fill
            className="object-contain p-0.5"
            sizes="52px"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-text-primary truncate">
            {recommendation.name}
          </p>
          <p className="text-xs text-text-secondary mt-0.5">
            {recommendation.weightLabel} ·{" "}
            <span className="font-bold text-brand-primary">
              ₹{recommendation.price.toFixed(0)}
            </span>
          </p>
        </div>

        <button
          onClick={handleAdd}
          disabled={adding || added}
          className={`h-8 px-3.5 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shrink-0 ${added
            ? "bg-green-600 text-white"
            : "bg-bg-dark text-white hover:bg-bg-dark/90 active:scale-95 disabled:opacity-50"
            }`}
        >
          {adding ? (
            <Loader2 size={13} className="animate-spin" />
          ) : added ? (
            <>
              <Check size={13} />
              Added
            </>
          ) : (
            <>
              <Plus size={13} />
              Add
            </>
          )}
        </button>
      </div>
    </div>
  );
}
