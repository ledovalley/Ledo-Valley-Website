"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import ProductImages from "@/components/products/ProductImages";
import ProductInfo from "@/components/products/ProductInfo";
import ProductReviews from "@/components/products/ProductReviews";
import { AxiosError } from "axios";

import { Product } from "@/types/product-api";


interface EligibleOrder {
  orderId: string;
  orderNumber: string;
}

export default function ProductPageClient({ product: initialProduct }: { product: Product }) {
  const [product, setProduct] = useState<Product>(initialProduct);
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    initialProduct.variants[0]?._id || ""
  );
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [canReview, setCanReview] = useState(false);

  // Fetch review eligibility on mount (requires auth, gracefully ignored if not logged in)
  useEffect(() => {
    let cancelled = false;
    async function checkEligibility() {
      try {
        const res = await api.get(
          `/customer/products/${initialProduct._id}/review-eligibility`
        );
        if (cancelled) return;
        setCanReview(res.data.eligible);
        setEligibleOrders(res.data.orders || []);
      } catch {
        if (!cancelled) setCanReview(false);
      }
    }
    checkEligibility();
    return () => { cancelled = true; };
  }, [initialProduct._id]);

  const handleReviewSubmit = async (
    rating: number,
    review: string,
    orderId: string
  ) => {
    try {
      await api.post(`/customer/products/${product._id}/review`, {
        rating,
        review,
        orderId,
      });

      // Refresh product data to show new review
      const updated = await api.get(`/customer/products/${product.slug}`);
      setProduct(updated.data);
      setCanReview(false);
      setEligibleOrders([]);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="bg-bg-page">
      {/* ================= PRODUCT SECTION ================= */}
      <div
        className="
          max-w-7xl mx-auto
          px-4 sm:px-6 lg:px-8
          pt-24 sm:pt-28 lg:pt-36
          pb-12 sm:pb-16
          grid grid-cols-1 lg:grid-cols-12
          gap-8 lg:gap-16
          min-w-0
        "
      >
        {/* Images */}
        <div className="col-span-12 lg:col-span-6 lg:sticky lg:top-28 h-fit">
          <ProductImages
            variants={product.variants}
            selectedVariantId={selectedVariantId}
          />
        </div>

        {/* Info */}
        <div className="col-span-12 lg:col-span-6">
          <ProductInfo
            product={product}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
          />
        </div>
      </div>

      {/* ================= REVIEWS ================= */}
      <div className="border-t border-border-muted/20 mt-10 sm:mt-16">
        <ProductReviews
          reviews={product.reviews}
          rating={product.rating}
          reviewCount={product.reviewCount}
          canReview={canReview}
          eligibleOrders={eligibleOrders}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </div>
  );
}
