"use client";

import Link from "next/link";

export default function ReturnsRefundPolicyPage() {
  return (
    <main className="bg-background text-text-primary pt-36 pb-20">
      
      {/* ================= HERO ================= */}
      <section className="bg-linear-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-playfair font-semibold tracking-tight">
            Returns & Refund Policy
          </h1>
          <p className="mt-4 text-text-muted text-sm md:text-base">
            Please review our return and refund guidelines carefully.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="container mx-auto px-6 mt-14 max-w-4xl">
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-text-muted">

          {/* DAMAGED PRODUCTS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              1. Damaged or Broken Products
            </h2>

            <p className="mt-4">
              If you receive your package in a damaged or broken condition,
              please notify us within <strong>24 hours of delivery</strong>.
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>
                Send clear images of the damaged carton and product.
              </li>
              <li>
                Mention the damage while acknowledging delivery with the courier partner,
                or refuse to accept the delivery.
              </li>
              <li>
                Ensure the product remains unused and in its original packaging.
              </li>
            </ul>

            <p className="mt-4">
              Please contact us at:
            </p>

            <p className="mt-2 font-medium text-text-primary">
              contact@ledovalley.com
            </p>
          </div>

          {/* DEFECTIVE PRODUCTS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              2. Defective Products
            </h2>

            <p className="mt-4">
              If you receive a defective product, please inform us within
              <strong> 24 hours of delivery</strong> with supporting images.
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>Provide images clearly showing the defect.</li>
              <li>Ensure the product is unused and in original condition.</li>
            </ul>

            <p className="mt-4">
              Once the issue is acknowledged, we will arrange reverse pickup.
              After receiving the product at our facility, we will verify its
              condition and initiate the appropriate refund or replacement process.
            </p>
          </div>

          {/* TASTE DISCLAIMER */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              3. Taste Preference Disclaimer
            </h2>

            <p className="mt-4">
              Taste is subjective and varies from individual to individual.
              We encourage customers to explore new products with the understanding
              that preferences differ.
            </p>

            <p className="mt-4 font-medium text-text-primary">
              Refunds or returns will not be accepted based on personal taste preferences.
            </p>
          </div>

          {/* REFUND TIMELINE */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              4. Refund Processing Timeline
            </h2>

            <p className="mt-4">
              Once a refund is approved and processed, the amount will be credited
              within <strong>3–5 business days</strong>, depending on your payment method
              and banking institution.
            </p>
          </div>

          {/* IMPORTANT NOTE */}
          <div className="bg-muted/40 border border-border rounded-2xl p-6">
            <p className="text-sm md:text-base">
              Ledo Valley reserves the right to decline return or refund requests
              if the product does not meet the conditions outlined in this policy.
            </p>
          </div>

        </div>
      </section>

      {/* ================= FOOTER CTA ================= */}
      <section className="mt-20 bg-primary py-14 text-center text-text-primary">
        <div className="container mx-auto px-6 max-w-3xl">
          <h3 className="text-xl md:text-2xl font-playfair font-semibold">
            Quality & Customer Commitment
          </h3>
          <p className="mt-3 text-sm md:text-base opacity-90">
            We are committed to delivering products that meet the highest standards.
          </p>
          <Link
            href="/contact"
            className="inline-block mt-6 px-8 py-3 rounded-full bg-bg-dark hover:bg-bg-dark/90 cursor-pointer text-text-on-dark text-sm font-medium hover:opacity-90 transition"
          >
            Contact Support
          </Link>
        </div>
      </section>

    </main>
  );
}
