"use client";

import Link from "next/link";
import useTopSellerProducts, { type Product } from "@/hooks/useTopSellerProducts";
import TopSellerProductCard from "../products/TopSellerProductCard";

export default function TopSellerSection({ initialProducts }: { initialProducts?: Product[] }) {
  const { products, loading } = useTopSellerProducts(initialProducts);

  if (loading || !products.length) return null;

  return (
    <section className="bg-bg-page py-14">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-5xl font-medium font-playfair text-text-primary">
            Top Sellers
          </h2>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-6 sm:gap-8">
          {products.map((product) => {
            const variant = product.variants[0];
            if (!variant) return null;

            return (
              <TopSellerProductCard
                key={product._id}
                productId={product._id}
                slug={product.slug}
                name={product.name}
                rating={product.rating}
                reviewCount={product.reviewCount}
                variant={variant}
              />
            );
          })}
        </div>

        <div className="flex w-full items-center justify-center mt-8">
          <Link
            href="/shop"
            className="text-sm px-14 py-3 rounded-full text-text-on-dark font-medium bg-bg-dark hover:bg-bg-dark/90"
          >
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
