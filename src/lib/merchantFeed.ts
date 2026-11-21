/*
 * Google Merchant Center product feed (RSS 2.0 with g: fields).
 * One item per pack size; sizes of the same tea are grouped with
 * item_group_id so Google shows them as one product with options.
 *
 * Only pack sizes the product page actually offers (active, in stock)
 * are listed, so Google never finds a price or size the page doesn't show.
 */

export const SITE = "https://www.ledovalley.com";
export const BRAND = "Ledo Valley";
const GOOGLE_CATEGORY = "Food, Beverages & Tobacco > Beverages > Tea & Infusions";

export interface FeedVariant {
  _id: string;
  variantSku?: string;
  weight?: { value: number; unit: string };
  sellingPrice?: number;
  finalPrice: number;
  stock?: number;
  availability?: boolean;
  status?: string;
  images?: { url: string }[];
}

export interface FeedProduct {
  _id: string;
  name: string;
  slug: string;
  sku?: string;
  description?: string;
  teaType?: string;
  status?: string;
  variants: FeedVariant[];
}

export const xmlEscape = (v: unknown) =>
  String(v ?? "")
    // characters XML 1.0 doesn't allow
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const plainText = (html = "") =>
  html
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|h\d)>/gi, ". ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s*\.\s*\./g, ".")
    .replace(/\s+/g, " ")
    .trim();

export const packLabel = (w?: { value: number; unit: string }) =>
  w && Number.isFinite(Number(w.value)) ? `${Number(w.value)} ${w.unit}` : "";

const money = (n: number) => `${Number(n).toFixed(2)} INR`;

/* Large JPEG from Cloudinary: Google wants at least 100×100 (ideally 800+), no AVIF. */
export const feedImage = (url?: string) => {
  if (!url) return undefined;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const [before, after] = url.split("/upload/");
  if (/^[a-z]{1,3}_[^/]+\//.test(after) && !/^v\d+\//.test(after)) return url;
  return `${before}/upload/f_jpg,q_auto,c_limit,w_1200/${after}`;
};

export const isOnSale = (v: FeedVariant) =>
  v.status !== "INACTIVE" && v.availability !== false && Number(v.stock ?? 0) > 0;

export const variantUrl = (slug: string, variantId: string) =>
  `${SITE}/shop/${encodeURIComponent(slug)}?variant=${encodeURIComponent(variantId)}`;

const tag = (name: string, value: unknown) =>
  value === undefined || value === null || value === "" ? "" : `<g:${name}>${xmlEscape(value)}</g:${name}>`;

/* title, link and description are plain RSS elements in Google's feed format. */
const rssTag = (name: string, value: unknown) => `<${name}>${xmlEscape(value)}</${name}>`;

export function feedItems(products: FeedProduct[]): string[] {
  const items: string[] = [];

  for (const p of products) {
    if (p.status && p.status !== "ACTIVE") continue;

    const variants = (p.variants || []).filter(isOnSale);
    if (!variants.length) continue;

    const description =
      plainText(p.description).slice(0, 4900) ||
      `${p.name} — Assam tea from ${BRAND}, packed at source in Tinsukia, Assam.`;
    const brandInName = p.name.toLowerCase().includes(BRAND.toLowerCase());
    const allImages = p.variants.flatMap((v) => (v.images || []).map((i) => i.url)).filter(Boolean);

    for (const v of variants) {
      const pack = packLabel(v.weight);
      const title = `${brandInName ? p.name : `${BRAND} ${p.name}`}${pack ? ` – ${pack}` : ""}`.slice(0, 150);

      const own = (v.images || []).map((i) => i.url).filter(Boolean);
      const images = [...own, ...allImages.filter((u) => !own.includes(u))].map(feedImage).filter(Boolean) as string[];
      if (!images.length) continue; // Google rejects items without an image

      const price = Number(v.finalPrice);
      const regular = Number(v.sellingPrice);
      const discounted = Number.isFinite(regular) && regular > price + 0.009;

      items.push(
        [
          "<item>",
          tag("id", v.variantSku || v._id),
          tag("item_group_id", p.sku || p._id),
          rssTag("title", title),
          rssTag("description", description),
          rssTag("link", variantUrl(p.slug, v._id)),
          tag("image_link", images[0]),
          ...images.slice(1, 11).map((u) => tag("additional_image_link", u)),
          tag("availability", "in_stock"),
          tag("price", money(discounted ? regular : price)),
          discounted ? tag("sale_price", money(price)) : "",
          tag("brand", BRAND),
          tag("condition", "new"),
          // Own-brand tea without barcodes. If packs get GTIN barcodes, add g:gtin and drop this.
          tag("identifier_exists", "no"),
          tag("google_product_category", GOOGLE_CATEGORY),
          tag("product_type", p.teaType ? `Tea > ${p.teaType}` : "Tea"),
          tag("size", pack), // tells Google how the sizes in one group differ
          tag("shipping_weight", pack),
          "</item>",
        ]
          .filter(Boolean)
          .join("")
      );
    }
  }

  return items;
}

export const feedXml = (items: string[]) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${xmlEscape(BRAND)} – Assam Tea</title>
<link>${SITE}</link>
<description>Products from ${xmlEscape(BRAND)} for Google Merchant Center</description>
${items.join("\n")}
</channel>
</rss>
`;
