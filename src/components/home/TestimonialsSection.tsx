"use client";

import { useEffect, useState } from "react";
import { Star, StarHalf, CheckCircle } from "lucide-react";
import api from "@/lib/api";

export interface Testimonial {
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

/* initialTestimonials comes from the server (cached); the browser only fetches if it's missing. */
export default function TestimonialsSection({ initialTestimonials }: { initialTestimonials?: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials ?? []);
  const [loading, setLoading] = useState(!initialTestimonials);

  useEffect(() => {
    if (initialTestimonials) return;
    api
      .get("/admin/reviews/testimonials")
      .then((res) => {
        setTestimonials(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [initialTestimonials]);

  if (loading) return null;
  if (!testimonials.length) return null;

  return (
    <section className="bg-(--color-bg-dark) py-6">
      <div className="container mx-auto px-6">

        <h2 className="font-playfair text-(--color-text-on-dark) text-center text-3xl md:text-4xl font-medium mb-10">
          What Our Customers Say
        </h2>

        {/* Phones: one swipeable row (each card most of the screen wide, the
            next one peeking in). Larger screens: the grid as before. */}
        <div
          className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0"
          aria-label="Customer reviews"
        >
          {testimonials.map((item) => (
            <div
              key={item._id}
              className="
                bg-(--color-bg-page)
                rounded-2xl
                p-6
                flex flex-col
                gap-4
                w-[85%] shrink-0 snap-center md:w-auto
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
        {testimonials.length > 1 && (
          <p className="mt-2 text-center text-xs text-(--color-text-on-dark)/70 md:hidden">Swipe for more reviews →</p>
        )}
      </div>
    </section>
  );
}
