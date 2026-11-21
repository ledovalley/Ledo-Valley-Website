/*
 * Filter options for the shop, worked out from the products actually on
 * sale (instead of fixed sizes and a ₹0–4,000 slider).
 * Plain functions, so they run on the server and in the browser.
 */

export interface ShopFacets {
  /** Pack sizes on sale, in grams, smallest first. */
  weights: number[];
  /** Highest current price of any pack, rounded up for the slider. */
  priceMax: number;
}

interface VariantLike {
  status?: string;
  finalPrice?: number;
  weight?: { value?: number; unit?: string };
}

interface ProductLike {
  variants?: VariantLike[];
}

const toGrams = (w?: { value?: number; unit?: string }) => {
  const value = Number(w?.value);
  if (!Number.isFinite(value) || value <= 0) return null;
  const grams = String(w?.unit || "g").toLowerCase() === "kg" ? value * 1000 : value;
  return Math.round(grams * 1000) / 1000;
};

/* Round a price up to a tidy slider end: ₹216 → ₹250, ₹1,180 → ₹1,200. */
const roundUpPrice = (n: number) => {
  const step = n <= 500 ? 50 : n <= 2000 ? 100 : 500;
  return Math.max(step, Math.ceil(n / step) * step);
};

export function computeShopFacets(products: ProductLike[] | undefined): ShopFacets | undefined {
  if (!products?.length) return undefined;

  const weights = new Set<number>();
  let maxPrice = 0;

  for (const product of products) {
    for (const v of product.variants || []) {
      if (v.status && v.status !== "ACTIVE") continue;
      const grams = toGrams(v.weight);
      if (grams !== null) weights.add(grams);
      const price = Number(v.finalPrice);
      if (Number.isFinite(price) && price > maxPrice) maxPrice = price;
    }
  }

  if (!weights.size && !maxPrice) return undefined;

  return {
    weights: [...weights].sort((a, b) => a - b),
    priceMax: maxPrice > 0 ? roundUpPrice(maxPrice) : 4000,
  };
}

/* "250g", "1kg", "1.5kg", "1.3g" */
export function weightLabel(grams: number) {
  if (grams >= 1000) return `${Math.round((grams / 1000) * 100) / 100}kg`;
  return `${Math.round(grams * 100) / 100}g`;
}

/* Slider step that suits the range. */
export function priceStep(priceMax: number) {
  return priceMax <= 500 ? 10 : priceMax <= 2000 ? 50 : 100;
}
