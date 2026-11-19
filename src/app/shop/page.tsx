import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";
import { getPublicData } from "@/lib/serverData";
import type { ShopProduct } from "@/hooks/useShopProducts";
import { shopRequestKey } from "@/lib/shopKey";
import type { ShopBannerData } from "@/components/shop/ShopBanner";

// Rebuild the cached shop data in the background at most every 2 minutes.
export const revalidate = 120;

// Must match the defaults in ShopClient (page 1, 9 per page, newest, no filters).
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 9;
const DEFAULT_SORT = "newest";

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

export default async function ShopPage() {
  const [firstPage, banners] = await Promise.all([
    getPublicData<{ products?: ShopProduct[]; total?: number }>(
      `/customer/products?page=${DEFAULT_PAGE}&limit=${DEFAULT_LIMIT}&sort=${DEFAULT_SORT}`,
      120
    ),
    getPublicData<ShopBannerData[]>("/customer/shop-banner", 300),
  ]);

  const initialProducts = firstPage?.products
    ? {
        key: shopRequestKey(DEFAULT_PAGE, DEFAULT_LIMIT, DEFAULT_SORT, { teaTypes: [] }),
        products: firstPage.products,
        total: firstPage.total ?? firstPage.products.length,
      }
    : undefined;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading shop...
        </div>
      }
    >
      <ShopClient
        initialProducts={initialProducts}
        initialBanners={Array.isArray(banners) ? banners : undefined}
      />
    </Suspense>
  );
}
