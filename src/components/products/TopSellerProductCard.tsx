"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useUI } from "@/context/UIContext";

/* ================= TYPES ================= */

interface Variant {
  _id: string;
  finalPrice: number;
  sellingPrice: number;
  stock?: number;
  weight: {
    value: number;
    unit: string;
  };
  images: {
    url: string;
  }[];
}

interface Props {
  productId: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount?: number;
  variant: Variant;
  layout?: "default" | "compact";
}

/* ================= RATING ================= */

function RatingStars({
  rating,
  reviewCount,
}: {
  rating: number;
  reviewCount?: number;
}) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = rating >= star;
        const isHalf = rating >= star - 0.5 && rating < star;

        return (
          <span key={star} className="relative w-4 h-4">
            <span className="absolute inset-0 text-gray-300">★</span>

            {isFull && (
              <span className="absolute inset-0 text-yellow-400">★</span>
            )}

            {isHalf && (
              <span
                className="absolute inset-0 text-yellow-400 overflow-hidden"
                style={{ width: "50%" }}
              >
                ★
              </span>
            )}
          </span>
        );
      })}

      <span className="ml-1 text-xs text-text-secondary">
        {rating.toFixed(1)}
        {reviewCount !== undefined && ` (${reviewCount})`}
      </span>
    </div>
  );
}

/* ================= PRODUCT CARD ================= */

export default function ProductCard({
  productId,
  slug,
  name,
  rating,
  reviewCount,
  variant,
  layout = "default",
}: Props) {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { openLogin } = useUI(); // ✅ clean login trigger

  const [adding, setAdding] = useState(false);

  const image = variant.images?.[0]?.url;
  const stock = variant.stock ?? 0;

  const discountPercent =
    variant.sellingPrice > variant.finalPrice
      ? Math.round(
          ((variant.sellingPrice - variant.finalPrice) /
            variant.sellingPrice) *
            100
        )
      : 0;

  const handleAddToCart = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (stock <= 0 || adding) return;

    if (!isLoggedIn) {
      openLogin(); // ✅ no more window event hack
      return;
    }

    try {
      setAdding(true);

      await addToCart({
        productId,
        variantId: variant._id,
        name,
        slug,
        image: image || "",
        weightLabel: `${variant.weight.value}${variant.weight.unit}`,
        quantity: 1,
        priceAtAdd: variant.finalPrice,
      });
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      href={`/shop/${slug}`}
      className="group block transition"
    >
      {/* IMAGE */}
      <div
        className={clsx(
          "relative aspect-square bg-bg-surface overflow-hidden",
          layout === "default" ? "rounded-3xl" : "rounded-2xl"
        )}
      >
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-text-secondary">
            No image
          </div>
        )}

        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {discountPercent}% OFF
          </span>
        )}

        <button
          disabled={stock <= 0 || adding}
          onClick={handleAddToCart}
          className={clsx(
            "absolute bottom-4 left-1/2 -translate-x-1/2",
            "opacity-0 group-hover:opacity-100 transition cursor-pointer",
            stock <= 0
              ? "bg-gray-300 cursor-not-allowed"
              : adding
              ? "bg-bg-dark/70 text-white"
              : "bg-bg-dark text-white hover:bg-bg-dark/90",
            "text-sm font-medium rounded-full",
            layout === "default" ? "px-16 py-2" : "px-8 py-1.5"
          )}
        >
          {stock <= 0
            ? "Out of Stock"
            : adding
            ? "Adding..."
            : "Add to Cart"}
        </button>
      </div>

      {/* CONTENT */}
      <div
        className={clsx(
          "flex justify-between items-start",
          layout === "default" ? "py-4 px-6" : "py-3 px-4"
        )}
      >
        <div>
          <h3
            className={clsx(
              "font-semibold text-text-primary",
              layout === "default" ? "text-lg" : "text-sm"
            )}
          >
            {name}
          </h3>

          <p className="text-xs text-text-secondary mt-1">
            {variant.weight.value}
            {variant.weight.unit}
          </p>

          <RatingStars
            rating={rating}
            reviewCount={reviewCount}
          />
        </div>

        <div className="text-right">
          <span
            className={clsx(
              "font-bold text-brand-primary",
              layout === "default" ? "text-lg" : "text-base"
            )}
          >
            ₹{variant.finalPrice.toFixed(0)}
          </span>

          {discountPercent > 0 && (
            <div className="text-xs line-through text-text-secondary">
              ₹{variant.sellingPrice.toFixed(0)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
