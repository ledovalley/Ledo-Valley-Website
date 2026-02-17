"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

import ProductImages from "@/components/products/ProductImages";
import ProductInfo from "@/components/products/ProductInfo";
import ProductReviews from "@/components/products/ProductReviews";
import { AxiosError } from "axios";

/* ============================
   TYPES
============================ */

interface Variant {
  _id: string;
  weight: {
    value: number;
    unit: string;
  };
  sellingPrice: number;
  finalPrice: number;
  discount?: {
    type: "PERCENT" | "FLAT";
    value?: number;
  };
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

/* ============================
   PAGE
============================ */

export default function SingleProductPage() {
  const { slug } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [eligibleOrders, setEligibleOrders] = useState<EligibleOrder[]>([]);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    if (!slug) return;

    console.log("URL Slug:", slug);

    let isMounted = true;

    api
      .get(`/customer/products/${slug}`)
      .then(async (res) => {
        if (!isMounted) return;

        const data: Product = res.data;

        setProduct(data);
        setSelectedVariantId(data.variants[0]?._id || "");

        // 🔥 Check review eligibility
        try {
          const eligibilityRes = await api.get(
            `/customer/products/${data._id}/review-eligibility`
          );

          setCanReview(eligibilityRes.data.eligible);
          setEligibleOrders(eligibilityRes.data.orders || []);
        } catch {
          setCanReview(false);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading product...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found.
      </div>
    );

  const handleReviewSubmit = async (
    rating: number,
    review: string,
    orderId: string
  ) => {
    if (!product) return;

    try {
      await api.post(
        `/customer/products/${product._id}/review`,
        {
          rating,
          review,
          orderId,
        }
      );

      // 🔥 Update UI without reload
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

  return (
    <div className="bg-bg-page">
      <div className="container mx-auto px-6 pt-40 pb-16 grid grid-cols-12 gap-12">
        {/* Images */}
        <div className="col-span-12 lg:col-span-6">
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

      {/* Reviews */}
      <ProductReviews
        reviews={product.reviews}
        rating={product.rating}
        reviewCount={product.reviewCount}
        canReview={canReview}
        eligibleOrders={eligibleOrders}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
}
