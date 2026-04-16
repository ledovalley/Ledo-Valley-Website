import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ledovalley.com/api";

import { Product, Variant, Review } from "@/types/product-api";


async function fetchProduct(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/customer/products/${slug}`, {
      next: { revalidate: 60 }, // ISR: revalidate every minute
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/* =====================================================
   GENERATE STATIC PARAMS (pre-render all product pages)
===================================================== */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/customer/products?limit=200&status=ACTIVE`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.products || []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

/* =====================================================
   GENERATE METADATA — Dynamic per-product SEO
===================================================== */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The product you are looking for does not exist.",
      robots: { index: false, follow: false },
    };
  }

  const firstImage = product.variants?.[0]?.images?.[0]?.url;
  const cheapestVariant = product.variants?.reduce(
    (min, v) => (v.finalPrice < (min?.finalPrice ?? Infinity) ? v : min),
    product.variants[0]
  );

  const priceStr = cheapestVariant
    ? `Starting at ₹${cheapestVariant.finalPrice}`
    : "";

  const title = `${product.name} | Buy Online`;
  const description = `${product.name} — Premium ${product.teaType} from Ledo Valley. ${priceStr}. ${product.bestFor?.length
      ? `Best for: ${product.bestFor.slice(0, 3).join(", ")}.`
      : ""
    } Shop authentic Assam tea online.`;

  const canonicalUrl = `https://www.ledovalley.com/shop/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${product.name} | Ledo Valley`,
      description,
      url: canonicalUrl,
      type: "website",
      images: firstImage
        ? [{ url: firstImage, width: 800, height: 800, alt: product.name }]
        : [{ url: "/og-banner1.jpeg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Ledo Valley`,
      description,
      images: firstImage ? [firstImage] : ["/og-banner1.jpeg"],
    },
  };
}

/* =====================================================
   PAGE — Server Component Shell
===================================================== */
export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) return notFound();

  // JSON-LD Product Schema for Google Rich Results (star ratings in search!)
  const cheapestVariant = product.variants?.reduce(
    (min, v) => (v.finalPrice < (min?.finalPrice ?? Infinity) ? v : min),
    product.variants[0]
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description?.replace(/<[^>]+>/g, "") || product.name,
    brand: {
      "@type": "Brand",
      name: "Ledo Valley",
    },
    url: `https://www.ledovalley.com/shop/${product.slug}`,
    image: product.variants.flatMap((v) => v.images.map((img) => img.url)),
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
    ...(cheapestVariant && {
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: cheapestVariant.finalPrice.toString(),
        availability:
          cheapestVariant.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "Ledo Valley",
        },
        url: `https://www.ledovalley.com/shop/${product.slug}`,
      },
    }),
    ...(product.reviews?.length > 0 && {
      review: product.reviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: "5",
        },
        author: {
          "@type": "Person",
          name: r.customerName,
        },
        reviewBody: r.review,
        datePublished: r.createdAt,
      })),
    }),
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.ledovalley.com" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://www.ledovalley.com/shop" },
      { "@type": "ListItem", position: 3, name: product.name, item: `https://www.ledovalley.com/shop/${product.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductPageClient product={product} />
    </>
  );
}