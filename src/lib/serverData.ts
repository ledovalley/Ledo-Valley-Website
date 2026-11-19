/*
 * Server-side, cached reads from the API for public page data
 * (banners, top sellers, testimonials, first page of the shop).
 *
 * Why: these used to be fetched by each visitor's browser after the page's
 * JavaScript loaded, and every visit woke the backend. Fetched here, Next.js
 * caches the result and refreshes it in the background, so visitors get
 * banners and products straight away, even while the backend is asleep.
 *
 * Returns undefined on any failure; components then fetch in the browser
 * as before, so nothing breaks if the API is slow or down.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.ledovalley.com/api";

export async function getPublicData<T>(
  path: string,
  revalidateSeconds = 300
): Promise<T | undefined> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: revalidateSeconds },
      // Don't hold the page up for a sleeping backend.
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}
