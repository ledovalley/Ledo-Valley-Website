import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Ledo Valley for bulk tea orders, business partnerships, or any product inquiries. Reach us at contact@ledovalley.com or call +91 70990-38036.",
  alternates: { canonical: "https://www.ledovalley.com/contact" },
  openGraph: {
    title: "Contact Ledo Valley | Assam Tea Supplier",
    description:
      "Reach out to Ledo Valley for bulk orders, partnerships, or product queries. Based in Tinsukia, Assam.",
    url: "https://www.ledovalley.com/contact",
    images: [{ url: "/og-banner.jpg", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
