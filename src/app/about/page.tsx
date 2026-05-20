import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Globe, Leaf, Award } from "lucide-react";
import heroImage from "@/assets/images/aboutUsBanner.webp";

export const metadata: Metadata = {
  title: "About Ledo Valley | Premium Assam Tea Brand Since 1968",
  description:
    "Learn about Ledo Valley — a premium Assam tea brand since 1968. Rooted in quality, safety, and the rich heritage of Assam's tea gardens in Tinsukia.",
  alternates: { canonical: "https://www.ledovalley.com/about" },
  openGraph: {
    title: "About Ledo Valley | Premium Assam Tea Since 1968",
    description: "Rooted in the rich tea heritage of Assam since 1968. Learn about our story, mission, and commitment to quality.",
    url: "https://www.ledovalley.com/about",
    images: [{ url: "/og-banner1.jpeg", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <main className="bg-background text-text-primary pb-20">

      {/* ================= HERO ================= */}
      <section
        className="relative h-[76vh] flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage.src})`,
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <div className="relative container mx-auto px-6 max-w-5xl text-center">
          <h1 className="text-4xl sm:text-4xl md:text-5xl font-playfair font-semibold tracking-tight text-white">
            About Ledo Valley
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg text-white/90">
            Delivering quality, safety, and excellence from Assam to the world.
          </p>
        </div>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="container mx-auto px-6 mt-16 max-w-5xl">
        <div className="space-y-6 text-text-muted leading-relaxed">
          <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-text-primary">
            From Bhiwani to Brahmputra
          </h2>
          <p>
            In 1968, Harilal Jain left Buwani Khera, Bhiwani, Haryana, and arrived in Tinsukia, Assam, with almost nothing. He started small — a few kilograms of tea, sold door to door, every single day. No shop. No capital. Just belief.
          </p>
          <p>
            That belief compounded. His son Sushil Kumar Jain took the trade across the districts of Assam, and earned a stake in the very tea estates his father had once traded from. His grandsons Yash and Abhay Jain took it further still — across the mountains and rivers of the Northeast, until Ledo Valley reached all seven states of the region.
          </p>
          <p>
            Three generations. One family. One unbroken commitment to the finest tea from the land they chose to call home.
          </p>
          <p className="flex flex-col">
            Crafted with care. Served with trust. Enjoyed by millions.
            <span className="text-primary font-bold">LEDO VALLEY TEA · TINSUKIA, ASSAM · EST. 1968</span>
          </p>
        </div>
      </section>

      {/* ================= MISSION & VISION ================= */}
      <section className="container mx-auto px-6 mt-20 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10">

          <div className="bg-card border border-border rounded-3xl p-8">
            <h3 className="text-xl font-playfair font-semibold">
              Our Mission
            </h3>
            <p className="mt-4 text-text-muted">
              To provide safe, high-quality consumer products that meet global
              standards while maintaining ethical sourcing, responsible
              manufacturing, and customer satisfaction.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8">
            <h3 className="text-xl font-playfair font-semibold">
              Our Vision
            </h3>
            <p className="mt-4 text-text-muted">
              To become a globally trusted brand known for quality, safety,
              innovation, and sustainable growth.
            </p>
          </div>

        </div>
      </section>

      {/* ================= QUALITY & SAFETY ================= */}
      <section className="container mx-auto px-6 mt-20 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-center">
          Quality & Food Safety Commitment
        </h2>

        <div className="grid md:grid-cols-4 gap-8 mt-12 text-center">

          <FeatureCard
            icon={<ShieldCheck className="w-8 h-8 text-primary" />}
            title="Certified Standards"
            text="We follow FSSC 22000 v5.1, ISO 22000:2018 and GMP practices."
          />

          <FeatureCard
            icon={<Award className="w-8 h-8 text-primary" />}
            title="Strict Quality Checks"
            text="Every batch undergoes rigorous quality and safety inspection."
          />

          <FeatureCard
            icon={<Leaf className="w-8 h-8 text-primary" />}
            title="Responsible Sourcing"
            text="We work closely with trusted suppliers to ensure raw material integrity."
          />

          <FeatureCard
            icon={<Globe className="w-8 h-8 text-primary" />}
            title="Global Outlook"
            text="Designed to meet both domestic and international market expectations."
          />

        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="container mx-auto px-6 mt-20 max-w-5xl">
        <h2 className="text-2xl md:text-3xl font-playfair font-semibold text-text-primary">
          Why Choose Ledo Valley?
        </h2>

        <ul className="list-disc pl-6 mt-6 space-y-4 text-text-muted">
          <li>Premium quality tea sourced from Assam.</li>
          <li>Modern hygienic processing facilities.</li>
          <li>Strict adherence to food safety regulations.</li>
          <li>Customer-first approach and transparent communication.</li>
          <li>Continuous improvement and innovation.</li>
        </ul>
      </section>

      {/* ================= CTA ================= */}
      <section className="mt-24 bg-primary py-16 text-center text-text-primary">
        <div className="container mx-auto px-6 max-w-3xl">
          <h3 className="text-xl md:text-2xl font-playfair font-semibold">
            Experience Quality You Can Trust
          </h3>
          <p className="mt-4 opacity-90">
            Discover our range of premium products crafted with care and commitment.
          </p>

          <Link
            href="/shop"
            className="inline-block mt-6 px-8 py-3 rounded-full bg-bg-dark hover:bg-bg-dark/90 cursor-pointer text-text-on-dark text-sm font-medium hover:opacity-90 transition"
          >
            Explore Products
          </Link>
        </div>
      </section>

    </main>
  );
}


/* ================= REUSABLE FEATURE CARD ================= */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

function FeatureCard({ icon, title, text }: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition">
      <div className="flex justify-center mb-4">{icon}</div>
      <h4 className="font-semibold text-lg">{title}</h4>
      <p className="mt-3 text-sm text-text-muted">{text}</p>
    </div>
  );
}
