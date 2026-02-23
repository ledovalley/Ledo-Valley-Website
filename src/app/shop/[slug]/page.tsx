"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

import ProductImages from "@/components/products/ProductImages";
import ProductInfo from "@/components/products/ProductInfo";
import ProductReviews from "@/components/products/ProductReviews";
import { AxiosError } from "axios";

/* ================= TYPES ================= */

interface Variant {
  _id: string;
  weight: { value: number; unit: string };
  sellingPrice: number;
  finalPrice: number;
  stock: number;
  images: { url: string }[];
}

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  bestFor: string[];
  rating: number;
  reviewCount: number;
  variants: Variant[];
  reviews: Review[];
}

interface EligibleOrder {
  orderId: string;
  orderNumber: string;
}

/* ================= PAGE ================= */

export default function SingleProductPage() {
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug;

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    async function fetchProduct() {
      try {
        const res = await api.get(`/customer/products/${slug}`);
        if (cancelled) return;

        const data: Product = res.data;

        setProduct(data);
        setSelectedVariantId(data.variants[0]?._id || "");

        try {
          const eligibilityRes = await api.get(
            `/customer/products/${data._id}/review-eligibility`
          );

          if (cancelled) return;

          setCanReview(eligibilityRes.data.eligible);
          setEligibleOrders(eligibilityRes.data.orders || []);
        } catch {
          if (!cancelled) setCanReview(false);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      }
    }

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /* ================= LOADING ================= */

  if (!product && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Loading product...
      </div>
    );
  }

  /* ================= ERROR ================= */

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-secondary">
        Product not found.
      </div>
    );
  }

  /* ================= REVIEW SUBMIT ================= */

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

      const updatedProduct = await api.get(
        `/customer/products/${product.slug}`
      );

      setProduct(updatedProduct.data);
      setCanReview(false);
      setEligibleOrders([]);
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
      }>;

      alert(
        axiosError.response?.data?.message ||
        "Failed to submit review"
      );
    }
  };

  /* ================= RENDER ================= */

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