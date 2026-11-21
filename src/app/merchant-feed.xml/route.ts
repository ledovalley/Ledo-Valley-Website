import { feedItems, feedXml, FeedProduct } from "@/lib/merchantFeed";

/*
 * https://www.ledovalley.com/merchant-feed.xml
 * Add this URL in Google Merchant Center → Products → Add products →
 * "Add products from a file" → "Enter a link to your file" (daily fetch).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ledovalley.com/api";
const PAGE_SIZE = 50; // the products API allows at most 50 per page
const MAX_PAGES = 20;

// Built on request (Google fetches it once a day); product data is cached for an hour.
export const dynamic = "force-dynamic";

async function allProducts(): Promise<FeedProduct[]> {
  const products: FeedProduct[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`${API_BASE}/customer/products?limit=${PAGE_SIZE}&page=${page}&sort=newest`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`Products API returned ${res.status}`);
    const data = await res.json();
    products.push(...(data.products || []));
    const totalPages = Number(data.totalPages) || 1;
    if (page >= totalPages || !(data.products || []).length) break;
  }
  return products;
}

export async function GET() {
  try {
    const products = await allProducts();
    const items = feedItems(products);
    return new Response(feedXml(items), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
        "X-Item-Count": String(items.length),
      },
    });
  } catch (error) {
    console.error("MERCHANT FEED FAILED:", error instanceof Error ? error.message : error);
    // 503 makes Merchant Center try again later instead of removing every product.
    return new Response("Product feed temporarily unavailable", {
      status: 503,
      headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
    });
  }
}
