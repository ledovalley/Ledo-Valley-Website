"use client";

import Link from "next/link";

export default function TermsOfUsePage() {
  return (
    <main className="bg-background text-text-primary pt-32 pb-20">

      {/* ================= HERO ================= */}
      <section className="bg-linear-to-b from-muted/30 to-background">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-playfair font-semibold tracking-tight">
            Terms of Use
          </h1>
          <p className="mt-4 text-text-muted text-sm md:text-base">
            Please read these terms carefully before using our website.
          </p>
        </div>
      </section>

      {/* ================= CONTENT ================= */}
      <section className="container mx-auto px-6 mt-14 max-w-4xl">
        <div className="space-y-12 text-sm md:text-base leading-relaxed text-text-muted">

          {/* INTRODUCTION */}
          <div>
            <h2 className="section-title">1. Introduction</h2>
            <p className="mt-4">
              Ledo Valley (www.ledovalley.com), based at Unit No. 17, Cosmo Plaza Market,
              A.T. Road, Tinsukia, Assam – 786125, is operated by Ledo Valley Consumer Products
              (&quot;Website Owner&quot;, &ldquo;we&quot;, &quot;us&quot;, or &quot;our&quot;).
            </p>
            <p className="mt-4">
              By browsing, accessing or using this Website, you agree to be bound by these
              Terms of Use, along with our Privacy Policy and other applicable policies.
              This Agreement is made between you and the Website Owner.
            </p>
          </div>

          {/* WEBSITE AVAILABILITY */}
          <div>
            <h2 className="section-title">2. Website Availability</h2>
            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>The Website may be suspended for maintenance, upgrades, or repairs without prior notice.</li>
              <li>We reserve the right to modify or discontinue any feature of the Website.</li>
              <li>We may terminate access if unauthorized or illegal use is detected.</li>
            </ul>
          </div>

          {/* YOUR STATUS */}
          <div>
            <h2 className="section-title">3. Your Status</h2>
            <p className="mt-4">
              By placing an order through this Website, you warrant that:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>You are legally capable of entering into binding contracts.</li>
              <li>You are at least 18 years of age.</li>
            </ul>
          </div>

          {/* CONTRACT TERMS */}
          <div>
            <h2 className="section-title">4. Order Acceptance & Contract</h2>
            <p className="mt-4">
              After placing an order, you will receive an acknowledgment email.
              This does not constitute acceptance of your order.
            </p>
            <p className="mt-4">
              A binding contract is formed only when a Dispatch Confirmation
              email is sent to you.
            </p>
          </div>

          {/* PAYMENTS */}
          <div>
            <h2 className="section-title">5. Credit Card Payment</h2>
            <p className="mt-4">
              You must use your own valid credit card for transactions.
              We shall not be liable for any credit card fraud. The liability
              for fraudulent use rests solely with the user.
            </p>
          </div>

          {/* TRADEMARKS */}
          <div>
            <h2 className="section-title">6. Intellectual Property</h2>
            <p className="mt-4">
              All trademarks, logos, and service marks displayed on this Website
              are the property of Ledo Valley or its partners.
              No license or right is granted without prior written permission.
            </p>
          </div>

          {/* EXTERNAL LINKS */}
          <div>
            <h2 className="section-title">7. External Links</h2>
            <p className="mt-4">
              External links are provided for convenience. We are not responsible
              for the content or policies of third-party websites.
            </p>
          </div>

          {/* ACCEPTABLE USE */}
          <div>
            <h2 className="section-title">8. Acceptable Use</h2>
            <p className="mt-4">
              You agree not to use the Website to post unlawful, abusive,
              defamatory, obscene, or harmful content.
            </p>
            <p className="mt-4">
              You indemnify the Website Owner against any losses resulting
              from such misuse.
            </p>
          </div>

          {/* LIABILITY */}
          <div>
            <h2 className="section-title">9. Disclaimer of Liability</h2>
            <p className="mt-4">
              The Website Owner shall not be liable for any direct,
              indirect or consequential loss arising from your use of the Website.
              Use of the Website is at your own risk.
            </p>
          </div>

          {/* NON-COMMERCIAL USE */}
          <div>
            <h2 className="section-title">10. No Commercial Use</h2>
            <p className="mt-4">
              This Website is for personal, non-commercial use only.
              You may not copy, distribute, modify or commercially exploit
              any content without written consent.
            </p>
          </div>

          {/* REGISTRATION */}
          <div>
            <h2 className="section-title">11. Visitor Registration</h2>
            <p className="mt-4">
              You agree to provide accurate and complete information during registration.
              You must notify us of any changes to your information.
            </p>
          </div>

          {/* GENERAL LEGAL */}
          <div>
            <h2 className="section-title">12. General Provisions</h2>
            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>These Terms constitute the entire agreement between you and us.</li>
              <li>We may modify these Terms at any time.</li>
              <li>If any provision is unenforceable, the remainder remains valid.</li>
              <li>These Terms are governed by the laws of India.</li>
              <li>Disputes are subject to exclusive jurisdiction of Indian courts.</li>
            </ul>
          </div>

          {/* FOOD SAFETY POLICY */}
          <div>
            <h2 className="section-title">13. Food Safety Policy</h2>
            <p className="mt-4">
              At Ledo Valley Consumer Products, we are committed to the highest
              standards of food safety and quality.
            </p>

            <ul className="list-disc pl-6 mt-4 space-y-3">
              <li>Clean, contamination-free facilities.</li>
              <li>Compliance with all food safety regulations.</li>
              <li>Employee training and supervision.</li>
              <li>Strict supplier quality standards.</li>
              <li>Adherence to global standards including FSSC 22000 v5.1, ISO 22000:2018, and GMP.</li>
            </ul>

            <p className="mt-4">
              Our mission is to deliver safe, high-quality products while maintaining
              the trust of our customers.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="section-title">14. Contact Information</h2>
            <p className="mt-4">
              For any questions regarding these Terms, please contact us at:
            </p>
            <p className="mt-2 font-medium text-text-primary">
              contact@ledovalley.com
            </p>
          </div>

        </div>
      </section>

      {/* ================= FOOTER CTA ================= */}
      <section className="mt-20 bg-primary py-14 text-center text-text-primary">
        <div className="container mx-auto px-6 max-w-3xl">
          <h3 className="text-xl md:text-2xl font-playfair font-semibold">
            Committed to Transparency & Compliance
          </h3>
          <p className="mt-3 text-sm md:text-base opacity-90">
            Ledo Valley operates in accordance with Indian law and industry standards.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-8 py-3 rounded-full bg-bg-dark hover:bg-bg-dark/90 text-text-on-dark cursor-pointer text-sm font-medium hover:opacity-90 transition"
          >
            Back to Home
          </Link>
        </div>
      </section>

    </main>
  );
}
