"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Check, Loader2, Sparkles, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Product, Variant } from "@/types/product-api";
import { toast } from "sonner";
import { trackEcommerce } from "@/lib/gtm";

interface FBTItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  weightLabel: string;
  price: number;
  originalPrice?: number;
  isCurrent: boolean;
}

interface ApiProduct {
  _id: string;
  name: string;
  slug: string;
  status?: string;
  variants?: {
    _id: string;
    stock?: number;
    status?: string;
    availability?: boolean;
    finalPrice?: number;
    sellingPrice?: number;
    weight?: { value: number; unit: string };
    images?: { url: string }[];
  }[];
}

interface Props {
  currentProduct: Product;
  selectedVariantId: string;
}

const inr = (n: number) => `₹${Math.ceil(n).toLocaleString("en-IN")}`;

export default function FrequentlyBoughtTogether({
  currentProduct,
  selectedVariantId,
}: Props) {
  const { addManyToCart } = useCart();
  const [candidates, setCandidates] = useState<ApiProduct[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const [addingAll, setAddingAll] = useState(false);

  // Fetch complementary products
  useEffect(() => {
    let alive = true;
    const fetchCandidates = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://api.ledovalley.com/api";
        const res = await fetch(
          `${baseUrl}/customer/products?limit=10&sort=popular`
        );
        if (res.ok) {
          const data = await res.json();
          if (alive) {
            setCandidates((data?.products as ApiProduct[]) || []);
          }
        }
      } catch {
        // silent fallback
      } finally {
        if (alive) setLoadingCandidates(false);
      }
    };
    fetchCandidates();
    return () => {
      alive = false;
    };
  }, []);

  // Find active variant of current product
  const currentVariant = useMemo<Variant | undefined>(() => {
    return (
      currentProduct.variants.find((v) => v._id === selectedVariantId) ||
      currentProduct.variants[0]
    );
  }, [currentProduct.variants, selectedVariantId]);

  // Build the 3 bundle items
  const bundleItems = useMemo<FBTItem[]>(() => {
    if (!currentVariant) return [];

    let currentImg = currentVariant.images?.[0]?.url;
    if (!currentImg) {
      for (const v of currentProduct.variants) {
        if (v.images?.[0]?.url) {
          currentImg = v.images[0].url;
          break;
        }
      }
    }
    if (!currentImg) currentImg = "/og-banner1.jpeg";

    const items: FBTItem[] = [
      {
        productId: currentProduct._id,
        variantId: currentVariant._id,
        name: currentProduct.name,
        slug: currentProduct.slug,
        image: currentImg,
        weightLabel: `${currentVariant.weight?.value ?? ""}${currentVariant.weight?.unit ?? ""}`,
        price: currentVariant.finalPrice ?? currentVariant.sellingPrice,
        originalPrice:
          currentVariant.sellingPrice > currentVariant.finalPrice
            ? currentVariant.sellingPrice
            : undefined,
        isCurrent: true,
      },
    ];

    for (const p of candidates) {
      if (items.length >= 3) break;
      if (p._id === currentProduct._id || (p.status && p.status !== "ACTIVE"))
        continue;

      const v = p.variants?.find(
        (v) =>
          Number(v.stock) > 0 &&
          v.status !== "INACTIVE" &&
          v.availability !== false &&
          !!v.images?.[0]?.url
      );

      if (!v || !v.images?.[0]?.url) continue;

      items.push({
        productId: p._id,
        variantId: v._id,
        name: p.name,
        slug: p.slug,
        image: v.images[0].url,
        weightLabel: `${v.weight?.value ?? ""}${v.weight?.unit ?? ""}`,
        price: Number(v.finalPrice ?? v.sellingPrice ?? 0),
        originalPrice:
          Number(v.sellingPrice) > Number(v.finalPrice)
            ? Number(v.sellingPrice)
            : undefined,
        isCurrent: false,
      });
    }

    return items;
  }, [currentProduct, currentVariant, candidates]);

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (bundleItems.length > 0) {
      setSelectedIds(
        bundleItems.map((item) => `${item.productId}-${item.variantId}`)
      );
    }
  }, [bundleItems]);

  const toggleSelect = (key: string) => {
    setSelectedIds((prev) =>
      prev.includes(key) ? prev.filter((id) => id !== key) : [...prev, key]
    );
  };

  const selectedItems = useMemo(() => {
    return bundleItems.filter((item) =>
      selectedIds.includes(`${item.productId}-${item.variantId}`)
    );
  }, [bundleItems, selectedIds]);

  const totalPrice = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + item.price, 0);
  }, [selectedItems]);

  const totalOriginalPrice = useMemo(() => {
    return selectedItems.reduce(
      (acc, item) => acc + (item.originalPrice ?? item.price),
      0
    );
  }, [selectedItems]);

  const handleAddAllToCart = async () => {
    if (selectedItems.length === 0 || addingAll) return;
    try {
      setAddingAll(true);
      const itemsToAdd = selectedItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: 1,
        name: `${item.name} (${item.weightLabel})`,
      }));

      const { added, failed } = await addManyToCart(itemsToAdd);

      if (added > 0) {
        // Fire GA4 / GTM add_to_cart ecommerce event for all added bundle items
        const failedIds = new Set(failed.map((f) => f.name));
        const successfullyAdded = selectedItems.filter(
          (item) => !failedIds.has(`${item.name} (${item.weightLabel})`)
        );

        if (successfullyAdded.length > 0) {
          trackEcommerce("add_to_cart", {
            currency: "INR",
            value: successfullyAdded.reduce((sum, item) => sum + item.price, 0),
            items: successfullyAdded.map((item) => ({
              item_id: item.productId,
              item_name: item.name,
              price: item.price,
              item_variant: item.weightLabel,
              item_brand: "Ledo Valley",
              item_category: "Tea",
              quantity: 1,
            })),
          });
        }

        toast.success(
          `Added ${added} item${added > 1 ? "s" : ""} to your cart!`
        );
      }
      if (failed.length > 0) {
        toast.warning(
          `Could not add: ${failed.map((f) => `${f.name} (${f.reason})`).join(", ")}`
        );
      }
    } catch {
      toast.error("Failed to add items to cart");
    } finally {
      setAddingAll(false);
    }
  };

  if (bundleItems.length < 2 && !loadingCandidates) {
    return null;
  }

  return (
    <section className="my-12 sm:my-16 rounded-3xl bg-bg-surface border border-[#2e3116]/10 p-6 sm:p-9 relative overflow-hidden">
      {/* Header with Ledo Valley Aesthetic */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-full bg-[#0d4728]/10 text-[#0d4728]">
              <Sparkles size={14} />
            </span>
            <span className="text-xs uppercase tracking-widest font-semibold text-[#0d4728]">
              Perfect Tea Pairing
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0d4728] tracking-tight">
            Frequently Bought Together
          </h2>
        </div>

        <span className="text-xs font-medium text-[#2e3116]/60 bg-[#fffee4] border border-[#2e3116]/10 px-3 py-1 rounded-full">
          Curated by Ledo Valley Tea Masters
        </span>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">

        {/* ================= PRODUCTS CAROUSEL / ROW ================= */}
        <div className="xl:col-span-8 flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-start gap-3 sm:gap-4">
          {bundleItems.map((item, index) => {
            const itemKey = `${item.productId}-${item.variantId}`;
            const isChecked = selectedIds.includes(itemKey);

            return (
              <div key={itemKey} className="flex items-center gap-3 sm:gap-4 shrink-0">
                {/* Unified Card Container */}
                <div
                  onClick={() => toggleSelect(itemKey)}
                  className={`w-36 sm:w-44 rounded-2xl p-3 border transition-all duration-200 cursor-pointer text-left select-none group flex flex-col justify-between ${isChecked
                    ? "bg-[#fffee4]/40 border-[#0d4728]/25 shadow-xs hover:border-[#0d4728]/50"
                    : "bg-gray-50/60 border-gray-200 opacity-50 grayscale hover:opacity-75"
                    }`}
                >
                  {/* Top: Image & Badge */}
                  <div className="relative w-full h-32 sm:h-36 rounded-xl bg-white border border-[#2e3116]/5 p-2 flex items-center justify-center mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 700px) 130px, 160px"
                      className="object-contain"
                    />

                    {/* Custom Styled Checkbox Pill */}
                    <div
                      className={`absolute top-2 right-2 w-5 h-5 rounded-md flex items-center justify-center transition-colors shadow-xs ${isChecked
                        ? "bg-[#0d4728] text-white"
                        : "bg-white/90 border border-gray-300 text-transparent"
                        }`}
                    >
                      <Check size={12} strokeWidth={3} />
                    </div>

                    {item.isCurrent && (
                      <span className="absolute bottom-2 left-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#0d4728] text-[#fffee4]">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Bottom: Info */}
                  <div className="space-y-1">
                    <p
                      className={`text-xs sm:text-[13px] font-semibold leading-snug line-clamp-2 ${isChecked ? "text-[#0d4728]" : "text-gray-400 line-through"
                        }`}
                    >
                      {item.name}
                    </p>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-[11px] text-[#2e3116]/60">
                        {item.weightLabel}
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-[#0d4728]">
                          {inr(item.price)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {inr(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* '+' Plus Symbol */}
                {index < bundleItems.length - 1 && (
                  <div className="w-7 h-7 rounded-full bg-[#0d4728]/5 flex items-center justify-center text-[#0d4728]/70 shrink-0">
                    <Plus size={16} strokeWidth={2.5} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ================= ACTION CARD ================= */}
        <div className="xl:col-span-4 bg-[#fffee4]/60 border border-[#0d4728]/15 rounded-2xl p-6 sm:p-7 flex flex-col justify-center">
          <div className="mb-5">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#2e3116]/60 block mb-1">
              Bundle Total ({selectedItems.length} items)
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl font-serif font-extrabold text-[#0d4728]">
                {inr(totalPrice)}
              </span>
              {totalOriginalPrice > totalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {inr(totalOriginalPrice)}
                </span>
              )}
            </div>
            <p className="text-2xs text-[#2e3116]/60 mt-1">
              Inclusive of all taxes & freshly packed from Assam estate
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddAllToCart}
            disabled={selectedItems.length === 0 || addingAll}
            className="w-full py-3.5 px-6 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 flex items-center justify-center gap-2.5 bg-[#0d4728] hover:bg-[#0a3820] active:scale-[0.98] text-[#fffee4] shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingAll ? (
              <>
                <Loader2 size={16} className="animate-spin text-[#fffee4]" />
                Adding to Bag...
              </>
            ) : (
              <>
                <ShoppingBag size={16} />
                <span>Add all {selectedItems.length} to Bag</span>
              </>
            )}
          </button>
        </div>

      </div>
    </section>
  );
}
