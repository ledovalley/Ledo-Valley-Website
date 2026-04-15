import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop Premium Assam Tea Online",
  description:
    "Browse and buy premium Assam teas online. Choose from Black Tea, Green Tea, Organic Tea, and Speciality Teas. Direct from Tinsukia, Assam. Fast delivery across India.",
  alternates: {
    canonical: "https://www.ledovalley.com/shop",
  },
  openGraph: {
    title: "Shop Premium Assam Tea | Ledo Valley",
    description: "Browse our full range of premium Assam teas. Black, Green, Organic & Speciality teas delivered fresh across India.",
    url: "https://www.ledovalley.com/shop",
    images: [{ url: "/og-banner1.jpeg", width: 1200, height: 630 }],
  },
};

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading shop...
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
