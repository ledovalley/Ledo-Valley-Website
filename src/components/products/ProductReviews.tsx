"use client";

import { useState } from "react";
import { Check, Star } from "lucide-react";

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface EligibleOrder {
  orderId: string;
  orderNumber: string;
}

interface Props {
  reviews: Review[];
  rating: number;
  reviewCount: number;
  canReview?: boolean;
  eligibleOrders?: EligibleOrder[];
  onSubmit?: (
    rating: number,
    review: string,
    orderId: string
  ) => void;
}

export default function ProductReviews({
  reviews,
  rating,
  reviewCount,
  canReview,
  eligibleOrders,
  onSubmit,
}: Props) {
  const [selectedOrder, setSelectedOrder] = useState("");
  const [ratingValue, setRatingValue] = useState(5);
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [reviewText, setReviewText] = useState("");
  const [visibleCount, setVisibleCount] = useState(4);

  /* =====================================
     STAR RENDER FUNCTION (WITH HALF)
  ====================================== */

  const renderStars = (value: number) => {
    return [...Array(5)].map((_, i) => {
      const starValue = i + 1;

      const isFull = value >= starValue;
      const isHalf = value >= starValue - 0.5 && value < starValue;

      return (
        <div
          key={i}
          className="relative cursor-pointer"
          onMouseMove={(e) => {
            const { left, width } =
              e.currentTarget.getBoundingClientRect();
            const x = e.clientX - left;
            const isHalfClick = x < width / 2;
            setHoverValue(isHalfClick ? starValue - 0.5 : starValue);
          }}
          onMouseLeave={() => setHoverValue(null)}
          onClick={() =>
            setRatingValue(hoverValue ?? starValue)
          }
        >
          {/* Background Star */}
          <Star
            size={18}
            className="text-gray-300"
          />

          {/* Filled */}
          {(isFull || isHalf) && (
            <Star
              size={18}
              className="absolute top-0 left-0 text-yellow-500 fill-yellow-500"
              style={{
                clipPath: isHalf
                  ? "inset(0 50% 0 0)"
                  : "none",
              }}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="
      max-w-7xl mx-auto 
      px-4 sm:px-6 lg:px-8 
      py-12 sm:py-16
    ">
      {/* ===================== HEADER ===================== */}

      <h2 className="text-2xl font-playfair mb-2">
        Reviews ({reviewCount})
      </h2>

      <div className="flex items-center gap-2 mb-8">
        {renderStars(rating)}
        <span className="text-sm text-text-secondary">
          {rating} / 5
        </span>
      </div>

      {reviews.length === 0 && (
        <p className="text-text-secondary mb-8">
          No reviews yet.
        </p>
      )}

      {/* ===================== REVIEW FORM ===================== */}

      {canReview && eligibleOrders && eligibleOrders.length > 0 && (
        <div className="border border-border-muted/20 bg-bg-surface/80 p-6 rounded-2xl mb-12">
          <h3 className="font-semibold mb-4">
            Write a Review
          </h3>

          <select
            className="border border-border-muted p-2 rounded-xl w-full mb-4"
            value={selectedOrder}
            onChange={(e) => setSelectedOrder(e.target.value)}
          >
            <option value="">Select Order</option>
            {eligibleOrders.map((order) => (
              <option
                key={order.orderId}
                value={order.orderId}
              >
                {order.orderNumber}
              </option>
            ))}
          </select>

          {/* ⭐ Star Selector */}
          <div className="">
            <p className="text-sm">Select Star</p>
            <div className="flex items-center gap-1 mb-4">
              {renderStars(hoverValue ?? ratingValue)}
              <span className="text-sm text-text-secondary ml-2">
                {(hoverValue ?? ratingValue).toFixed(1)}
              </span>
            </div>
          </div>

          <textarea
            rows={4}
            className="border border-border-muted p-3 rounded-xl w-full mb-4"
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />

          <button
            disabled={!selectedOrder || !reviewText}
            onClick={() =>
              onSubmit?.(
                ratingValue,
                reviewText,
                selectedOrder
              )
            }
            className="bg-bg-dark cursor-pointer hover:bg-bg-dark/90 text-white px-6 py-2 rounded-full disabled:opacity-50 hover:opacity-80 transition"
          >
            Submit Review
          </button>
        </div>
      )}

      {/* ===================== REVIEWS LIST ===================== */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.slice(0, visibleCount).map((review) => (
          <div
            key={review._id}
            className="border border-border-muted/20 p-6 rounded-2xl"
          >
            <div className="flex items-center gap-1 mb-2">
              {renderStars(review.rating)}
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">
                {review.customerName}
              </h4>

              {/* ✅ Verified Badge */}
              <span className="text-xs bg-bg-dark text-text-on-dark px-1 py-1 rounded-full">
                <Check size={10} strokeWidth={4} />
              </span>
            </div>

            <p className="text-sm text-text-secondary/70 leading-relaxed mb-3">
              {`"`}{review.review}{`"`}
            </p>

            <p className="text-xs text-text-secondary">
              Posted on {new Date(review.createdAt).toDateString()}
            </p>
          </div>
        ))}
      </div>

      {visibleCount < reviews.length && (
        <div className="text-center mt-6">
          <button
            onClick={() => setVisibleCount(reviews.length)}
            className="text-sm underline hover:opacity-70 transition"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
