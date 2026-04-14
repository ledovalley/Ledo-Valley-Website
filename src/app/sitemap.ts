import type { MetadataRoute } from "next";

const BASE_URL = "https://www.ledovalley.com";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ledovalley.com/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic product routes
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_BASE}/customer/products?limit=200`, {
      next: { revalidate: 86400 }, // Re-fetch once per day
    });

    if (res.ok) {
      const data = await res.json();
      productRoutes = (data.products || []).map(
        (product: { slug: string; updatedAt?: string }) => ({
          url: `${BASE_URL}/shop/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })
      );
    }
  } catch {
    // Silently fail — sitemap won't have product routes but won't break build
  }

  return [...staticRoutes, ...productRoutes];
}
