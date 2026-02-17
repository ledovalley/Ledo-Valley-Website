"use client";

import { useEffect, useState } from "react";
import { Star, StarHalf, CheckCircle } from "lucide-react";
import api from "@/lib/api";

interface Testimonial {
  _id: string;
  customerName: string;
  rating: number;
  review: string;
}

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex gap-1 text-highlight">
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} size={16} fill="currentColor" />
      ))}

      {hasHalfStar && (
        <StarHalf size={16} fill="currentColor" />
      )}

      {Array.from({ length: emptyStars }).map((_, i) => (
        <Star key={`empty-${i}`} size={16} />
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/reviews/testimonials")
      .then((res) => {
        setTestimonials(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (!testimonials.length) return null;

  return (
    <section className="bg-(--color-bg-dark) py-6">
      <div className="container mx-auto px-6">

        <h2 className="font-playfair text-(--color-text-on-dark) text-center text-3xl md:text-4xl font-medium mb-10">
          What Our Customer&apos;s Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="
                bg-(--color-bg-page)
                rounded-2xl
                p-6
                flex flex-col
                gap-4
              "
            >
              <StarRating rating={item.rating} />

              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-(--color-text-primary)">
                  {item.customerName}
                </p>

                <CheckCircle
                  size={16}
                  className="text-(--color-brand-primary)"
                />
              </div>

              <p className="text-sm leading-relaxed text-text-secondary">
                “{item.review}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
