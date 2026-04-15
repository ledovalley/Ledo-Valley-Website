"use client";

import TopSellerProductCard from "../products/TopSellerProductCard";
import ProductSkeleton from "../products/ProductSkeleton";

interface Variant {
  _id: string;
  finalPrice: number;
  sellingPrice: number;
  discount?: {
    type: "PERCENT" | "FLAT";
    value?: number;
  };
  weight: {
    value: number;
    unit: string;
  };
  images: {
    url: string;
  }[];
}

interface Product {
  _id: string;
  slug: string;          // ✅ REQUIRED
  name: string;
  rating: number;
  reviewCount: number;   // ✅ REQUIRED
  variants: Variant[];
}

interface Props {
  products: Product[];
  loading: boolean;
}

export default function ShopProducts({
  products,
  loading,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-text-secondary">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => {
        const variant = product.variants[0];
        if (!variant) return null;

        return (
          <TopSellerProductCard
            key={product._id}
            productId={product._id}
            slug={product.slug}              // ✅ FIXED
            name={product.name}
            rating={product.rating}
            reviewCount={product.reviewCount}
            variant={variant}
            layout="compact"
          />
        );
      })}
    </div>
  );
}
