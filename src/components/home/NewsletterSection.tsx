"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import api from "@/lib/api";
import axios from "axios";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await api.post("/customer/newsletter/subscribe", {
        email,
        source: "footer",
      });

      setMessage(res.data?.message || "Verification email sent");
      setEmail("");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Subscription failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-(--color-bg-dark)">
      <div className="container mx-auto p-6">
        <div className="bg-bg-page rounded-3xl px-6 py-10 md:px-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
            
            {/* LEFT — TEXT */}
            <div className="w-full md:w-[45%] text-center md:text-left">
              <h2 className="uppercase text-2xl md:text-3xl font-playfair font-semibold leading-tight text-(--color-text-primary)">
                Stay up to date about
                <br className="block sm:hidden lg:block" />
                our latest offers
              </h2>
            </div>

            {/* RIGHT — FORM */}
            <form
              className="w-full md:w-[55%] flex flex-col lg:flex-row items-center gap-4"
              onSubmit={handleSubscribe}
            >
              {/* EMAIL INPUT */}
              <div className="relative w-full">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-(--color-border-muted) text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-(--color-border-muted)"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={loading}
                className="w-full lg:w-auto bg-(--color-brand-primary) text-(--color-text-on-dark) px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
          </div>

          {/* FEEDBACK MESSAGE */}
          {(message || error) && (
            <div className="mt-6 text-center text-sm">
              {message && (
                <p className="text-green-600">{message}</p>
              )}
              {error && (
                <p className="text-red-500">{error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
