"use client";

import Link from "next/link";
import { SITE_INFO, qualityIssueMailto } from "@/lib/siteInfo";

export default function ReturnsPolicyContent() {
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
          {/* IN SHORT */}
          <div className="bg-muted/40 border border-border rounded-2xl p-6">
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              In short
            </h2>
            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>
                <strong className="text-text-primary">We don&apos;t accept returns or exchanges</strong>,
                except for quality issues: a damaged, defective or wrong product.
              </li>
              <li>
                To report one, email{" "}
                <a href={qualityIssueMailto()} className="underline underline-offset-2 text-text-primary">
                  {SITE_INFO.returnsEmail}
                </a>{" "}
                within <strong>{SITE_INFO.returnWindow} of delivery</strong> with your order number and clear photos.
              </li>
              <li>
                We check every report. Once verified, we refund the order or the affected items (or send a replacement),
                and confirm by email.
              </li>
            </ul>
          </div>


          {/* DAMAGED PRODUCTS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              1. Damaged or Broken Products
            </h2>

            <p className="mt-4">
              If you receive your package in a damaged or broken condition,
              please email us within <strong>{SITE_INFO.returnWindow} of delivery</strong>.
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
              <a href={qualityIssueMailto()} className="underline underline-offset-2">
                {SITE_INFO.returnsEmail}
              </a>
            </p>
          </div>

          {/* DEFECTIVE PRODUCTS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              2. Defective Products
            </h2>

            <p className="mt-4">
              If you receive a defective product, please email{" "}
              <a href={qualityIssueMailto()} className="underline underline-offset-2">{SITE_INFO.returnsEmail}</a>{" "}
              within <strong>{SITE_INFO.returnWindow} of delivery</strong> with supporting images.
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>Provide images clearly showing the defect.</li>
              <li>Ensure the product is unused and in original condition.</li>
            </ul>

            <p className="mt-4">
              Once we&apos;ve verified the issue, we will refund the order or the
              affected items, or send a replacement. If we need the product back,
              we will arrange a pickup first.
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
              within <strong>5–7 working days</strong>, depending on your payment method
              and banking institution.
            </p>
          </div>

          {/* REFUSED DELIVERIES */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              5. Orders Refused at Delivery
            </h2>

            <p className="mt-4">
              If a parcel is refused at delivery or can&apos;t be delivered (for example, nobody
              is available after the courier&apos;s attempts, or the address is incomplete), the
              courier returns it to us. Once it reaches us, we refund your order.
            </p>
            <p className="mt-4">
              Shipping both ways is a real cost to us, so we may deduct the shipping charges
              from the refund. We&apos;ll tell you the amount by email when we process it.
            </p>
            <p className="mt-4">
              If you refused the parcel because it arrived <strong>damaged or tampered with</strong>,
              you get a <strong>full refund</strong>. Please email us at{" "}
              <a href="mailto:ledovalley1@gmail.com" className="underline">ledovalley1@gmail.com</a>{" "}
              with a photo if you can, so we know.
            </p>
          </div>

          {/* CANCELLATIONS */}
          <div>
            <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
              6. Cancelling an Order
            </h2>

            <p className="mt-4">
              You can cancel an order yourself from <strong>My Orders</strong> until it has been
              booked with the courier (usually within one working day of ordering). Once the
              courier has been booked, the order can&apos;t be cancelled.
            </p>
            <p className="mt-4">
              If you have already paid, you get a <strong>full refund automatically</strong> to your
              original payment method. It usually reaches your account within 5–7 working days.
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
