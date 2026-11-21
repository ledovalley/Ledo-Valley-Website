import type { Metadata } from "next";
import { Leaf, Package, Truck, Handshake } from "lucide-react";
import { SITE_INFO, whatsappLink } from "@/lib/siteInfo";
import DistributorForm from "./DistributorForm";

export const metadata: Metadata = {
  title: "Become a Distributor | Wholesale Assam Tea",
  description:
    "Partner with Ledo Valley, an Assam tea brand since 1968. Wholesale and distributor enquiries for retailers, wholesalers, cafés, hotels and offices across India.",
  alternates: { canonical: "https://www.ledovalley.com/distributor" },
  openGraph: {
    title: "Become a Ledo Valley Distributor",
    description:
      "Wholesale and distribution enquiries for Ledo Valley Assam tea. Tell us about your business and we'll send our price list and terms.",
    url: "https://www.ledovalley.com/distributor",
    images: [{ url: "/og-banner1.jpeg", width: 1200, height: 630 }],
  },
};

/* Edit these to match what you offer partners. */
const REASONS = [
  {
    icon: Leaf,
    title: "Straight from Assam",
    text: "A family tea brand from Tinsukia since 1968. Our teas are sourced and packed in Assam.",
  },
  {
    icon: Package,
    title: "A range that sells",
    text: "Everyday CTC, green, organic and speciality teas in pack sizes for homes, shops and bulk buyers.",
  },
  {
    icon: Truck,
    title: "Reliable supply",
    text: "Regular dispatches from Assam, with tracking on every consignment.",
  },
  {
    icon: Handshake,
    title: "Direct relationship",
    text: "Talk to us directly about prices, credit terms, areas and promotional material.",
  },
];

const STEPS = [
  "Send us the form below. It takes about two minutes.",
  "We call you within two working days to understand your business and area.",
  "We share our wholesale price list, terms and samples where suitable.",
  "Place your first order and we dispatch from Assam.",
];

export default function DistributorPage() {
  const whatsapp = whatsappLink("Hello Ledo Valley! I'm interested in becoming a distributor.");

  return (
    <main className="pt-32 pb-20 bg-background text-text-primary">
      {/* ================= HERO ================= */}
      <section className="container max-w-4xl px-6 mx-auto text-center">
        <p className="text-sm font-medium tracking-wide uppercase text-text-secondary">
          Wholesale &amp; distribution
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl font-playfair">
          Become a Ledo Valley distributor
        </h1>
        <p className="mt-4 text-base md:mt-6 md:text-lg text-text-muted">
          We work with distributors, wholesalers, retail shops, cafés, hotels and offices across
          India. Tell us about your business and we&apos;ll get back to you with our price list and
          terms.
        </p>
        <div className="flex flex-col justify-center gap-3 mt-8 sm:flex-row">
          <a
            href="#enquiry"
            className="px-8 py-3 font-medium text-white rounded-full bg-bg-dark hover:bg-bg-dark/90"
          >
            Send an enquiry
          </a>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 font-medium border rounded-full border-border hover:bg-black/5"
            >
              Chat on WhatsApp
            </a>
          )}
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section className="container px-4 mx-auto mt-16 sm:px-6" aria-labelledby="why-heading">
        <h2 id="why-heading" className="mb-8 text-2xl font-semibold text-center md:text-3xl font-playfair">
          Why partner with us
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="p-6 border bg-bg-surface/60 border-border rounded-3xl">
              <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="container max-w-3xl px-6 mx-auto mt-16" aria-labelledby="steps-heading">
        <h2 id="steps-heading" className="mb-6 text-2xl font-semibold text-center md:text-3xl font-playfair">
          How it works
        </h2>
        <ol className="space-y-4">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-white rounded-full shrink-0 bg-bg-dark">
                {i + 1}
              </span>
              <span className="pt-1">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= FORM ================= */}
      <section id="enquiry" className="container px-4 mx-auto mt-16 sm:px-6 scroll-mt-32">
        <div className="flex justify-center">
          <DistributorForm />
        </div>
        <p className="mt-6 text-sm text-center text-text-muted">
          Prefer to talk? Call{" "}
          <a href={SITE_INFO.phoneHref} className="underline">
            {SITE_INFO.phoneDisplay}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${SITE_INFO.email}`} className="underline">
            {SITE_INFO.email}
          </a>{" "}
          ({SITE_INFO.hours}).
        </p>
      </section>
    </main>
  );
}
