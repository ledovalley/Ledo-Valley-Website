"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Star,
  UploadCloud,
  CheckCircle,
  Loader2,
  ImagePlus,
  ShieldCheck,
  Package2,
  UserCircle2,
  X,
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import Image from "next/image";

interface Variant {
  _id: string;
  variantSku: string;
  weight: { value: number; unit: string };
  images?: Array<{ url: string }>;
}

interface Product {
  _id: string;
  name: string;
  variants: Variant[];
}

const ratingLabels: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function SectionHeader({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
        {icon}
      </div>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
          Step {step}
        </div>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

export default function SubmitFeedbackPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get("/customer/products?limit=100");
        setProducts(res.data.products || []);
      } catch {
        console.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    const prod = products.find((p) => p._id === pId) || null;
    setSelectedProduct(prod);
    setSelectedVariantId("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const selectedRatingLabel = useMemo(() => {
    return ratingLabels[hoverRating || rating] || "Tap to rate";
  }, [hoverRating, rating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedProduct) {
      setError("Please select a product");
      return;
    }
    if (rating === 0) {
      setError("Please provide a rating");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("productId", selectedProduct._id);
      if (selectedVariantId) formData.append("variantId", selectedVariantId);
      formData.append("customerName", customerName);
      if (email) formData.append("email", email);
      if (phone) formData.append("phone", phone);
      formData.append("rating", rating.toString());
      formData.append("review", review);
      if (image) formData.append("image", image);

      await api.post("/customer/reviews/external", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess(true);
    } catch (err: unknown) {
      let message = "Failed to submit review. Please try again.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (err as { response?: unknown }).response;

        if (typeof response === "object" && response !== null && "data" in response) {
          const data = (response as { data?: unknown }).data;

          if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
          ) {
            message = (data as { message: string }).message;
          }
        }
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f8f7f4] px-4 py-10 sm:px-6">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center">
          <div className="w-full rounded-4xl border border-black/5 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="mx-auto mb-6 flex h-18 w-18 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle className="h-9 w-9" />
            </div>

            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-green-700">
              Review submitted
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Thank you for sharing
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
              Your feedback has been submitted successfully and will appear on the
              product page after moderation.
            </p>

            <Link
              href="/"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Return to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 mt-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified customer feedback form
          </div>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Share your experience
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
            Bought our tea through a partner or received it as a gift? We’d love
            to hear what you thought.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-black/5">
              Takes under 2 minutes
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-black/5">
              Photo optional
            </span>
            <span className="rounded-full bg-white px-3 py-1 ring-1 ring-black/5">
              Reviewed before publishing
            </span>
          </div>
        </div>

        <div className="rounded-4xl border border-black/5 bg-white/60 p-6 shadow-sm sm:p-8 md:p-10">
          {error && (
            <div
              className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="rounded-[28px] border border-black/5 bg-[#fcfbf8] p-5 sm:p-6">
              <SectionHeader
                step="1"
                title="What are you reviewing?"
                description="Choose the product you tried, and optionally select the variant."
                icon={<Package2 className="h-5 w-5" />}
              />

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="product"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Product <span className="text-red-500">*</span>
                  </label>

                  {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl bg-gray-100" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 max-h-105 overflow-y-auto p-1 pr-2 custom-scrollbar">
                      {products.map((p) => {
                        const img = p.variants?.[0]?.images?.[0]?.url || "https://images.unsplash.com/photo-1576092762791-dd9e2220c4c7?auto=format&fit=crop&q=80&w=300";
                        const isSelected = selectedProduct?._id === p._id;
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(p);
                              setSelectedVariantId("");
                            }}
                            className={`group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border p-4 text-center transition-all ${
                              isSelected
                                ? "border-amber-400 bg-amber-50 ring-2 ring-amber-400"
                                : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30 hover:shadow-sm"
                            }`}
                          >
                            <div className="relative h-20 w-20 overflow-hidden rounded-full ring-1 ring-black/5 bg-white shadow-sm">
                              <Image 
                                src={img} 
                                alt={p.name} 
                                fill 
                                sizes="80px"
                                className="object-cover" 
                              />
                            </div>
                            <span className={`text-xs font-medium leading-relaxed line-clamp-2 ${isSelected ? "text-amber-900" : "text-gray-800"}`}>
                              {p.name}
                            </span>
                            
                            {isSelected && (
                              <div className="absolute top-2 right-2 text-amber-600">
                                <CheckCircle className="h-5 w-5 fill-amber-100" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {selectedProduct && selectedProduct.variants?.length > 0 && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label
                      htmlFor="variant"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Variant / Size <span className="text-gray-400">(Optional)</span>
                    </label>
                    <select
                      id="variant"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      value={selectedVariantId}
                      onChange={(e) => setSelectedVariantId(e.target.value)}
                    >
                      <option value="">I’m not sure</option>
                      {selectedProduct.variants.map((v) => (
                        <option key={v._id} value={v._id}>
                          {v.weight.value}
                          {v.weight.unit} — {v.variantSku}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-black/5 bg-[#fcfbf8] p-5 sm:p-6">
              <SectionHeader
                step="2"
                title="Rate and review"
                description="Tell us how your experience was in a few quick steps."
                icon={<Star className="h-5 w-5" />}
              />

              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Overall rating <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-amber-100"
                        >
                          <Star
                            className={`h-9 w-9 transition ${(hoverRating || rating) >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-gray-300"
                              }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="rounded-full bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700">
                      {selectedRatingLabel}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-500">
                    Choose the rating that best reflects your overall experience.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="review"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Written review <span className="text-gray-400">(Optional)</span>
                  </label>
                  <textarea
                    id="review"
                    className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    rows={5}
                    placeholder="What stood out to you? Taste, aroma, packaging, freshness, or anything else."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                  <div className="mt-2 text-right text-xs text-gray-400">
                    {review.length}/500
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Add a photo <span className="text-gray-400">(Optional)</span>
                  </label>

                  {imagePreview ? (
                    <div className="rounded-3xl border border-gray-200 bg-white p-3">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-gray-200">
                          <Image
                            src={imagePreview}
                            alt="Selected review image preview"
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            Photo selected
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            JPG, PNG, or WEBP up to 5MB.
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <label className="inline-flex cursor-pointer items-center rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                              Change photo
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => {
                                setImage(null);
                                setImagePreview(null);
                              }}
                              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                            >
                              <X className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white px-6 py-8 text-center transition hover:border-amber-400 hover:bg-amber-50/30">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                        <ImagePlus className="h-6 w-6" />
                      </div>
                      <div className="mt-4 text-sm font-semibold text-gray-900">
                        Upload a photo with your review
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Supported formats: JPG, PNG, WEBP · Max size 5MB
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white">
                        <UploadCloud className="h-4 w-4" />
                        Choose image
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-black/5 bg-[#fcfbf8] p-5 sm:p-6">
              <SectionHeader
                step="3"
                title="About you"
                description="We only ask for the basics needed to attribute your review."
                icon={<UserCircle2 className="h-5 w-5" />}
              />

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    required
                    autoComplete="name"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                    placeholder="How should we display your name?"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Email <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      placeholder="For verification if needed"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-1.5 block text-sm font-medium text-gray-700"
                    >
                      Phone <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                      placeholder="Optional"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-[28px] border border-black/5 bg-[#faf8f2] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    Ready to submit?
                  </div>
                  <div className="mt-1 text-xs leading-6 text-gray-500">
                    By submitting, you agree to our terms regarding customer
                    feedback and moderation.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-55"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit feedback"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}