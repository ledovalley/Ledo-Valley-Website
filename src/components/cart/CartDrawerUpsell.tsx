"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { trackAddToCart } from "@/lib/gtm";

interface UpsellProduct {
  _id: string;
  name: string;
  slug: string;
  variantId: string;
  price: number;
  weightLabel: string;
  image: string;
}

interface ApiVariant {
  _id: string;
  stock?: number;
  status?: string;
  availability?: boolean;
  finalPrice?: number;
  sellingPrice?: number;
  weight?: { value: number; unit: string };
  images?: { url: string }[];
}

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  variants?: ApiVariant[];
}

/* Popular products, loaded once per visit (not on every cart change). */
let popularCache: ApiProduct[] | null = null;
let popularRequest: Promise<ApiProduct[]> | null = null;

const loadPopular = () => {
  if (popularCache) return Promise.resolve(popularCache);
  if (!popularRequest) {
    // Plain fetch: this card is optional, so a slow or failed request must not
    // show the "server waking up" screen or an error toast.
    popularRequest = fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/products?sort=popular&limit=6`)
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((data) => {
        popularCache = (data?.products as ApiProduct[]) || [];
        return popularCache;
      })
      .catch(() => [] as ApiProduct[])
      .finally(() => {
        popularRequest = null;
      });
  }
  return popularRequest;
};

/* A pack the shop actually sells right now (inactive or hidden packs can't be checked out). */
const sellable = (v: ApiVariant) =>
  Number(v.stock) > 0 && v.status !== "INACTIVE" && v.availability !== false && !!v.images?.[0]?.url;

export default function CartDrawerUpsell() {
  const { cart, addToCart } = useCart();
  const [products, setProducts] = useState<ApiProduct[]>(popularCache || []);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    loadPopular().then((list) => {
      if (alive) setProducts(list);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Suggest a different tea than the ones already in the cart.
  const recommendation = useMemo<UpsellProduct | null>(() => {
    const inCart = new Set(cart.map((c) => c.productId));
    for (const p of products) {
      if (inCart.has(p._id) || (p.status && p.status !== "ACTIVE")) continue;
      const v = p.variants?.find(sellable);
      if (!v) continue;
      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        variantId: v._id,
        price: Number(v.finalPrice ?? v.sellingPrice ?? 0),
        weightLabel: `${v.weight?.value ?? ""}${v.weight?.unit ?? ""}`,
        image: v.images![0].url,
      };
    }
    return null;
  }, [products, cart]);

  if (!recommendation) return null;

  const handleAdd = async () => {
    if (adding) return;
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

      trackAddToCart({
        id: recommendation._id,
        name: recommendation.name,
        price: recommendation.price,
      }, 1);
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
          disabled={adding}
          aria-label={`Add ${recommendation.name} ${recommendation.weightLabel} to cart`}
          className="h-8 px-3.5 rounded-full text-xs font-semibold cursor-pointer transition flex items-center gap-1.5 shrink-0 bg-bg-dark text-white hover:bg-bg-dark/90 active:scale-95 disabled:opacity-50"
        >
          {adding ? (
            <Loader2 size={13} className="animate-spin" />
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
