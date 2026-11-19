/*
 * Ask Cloudinary for a resized, compressed copy of an image
 * (auto format such as WebP/AVIF, auto quality, given width).
 * Non-Cloudinary URLs, or ones that already have transformations, are
 * returned unchanged.
 */
export function cloudinaryResized(url: string | undefined, width: number): string | undefined {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const [before, after] = url.split("/upload/");
  // Already transformed (e.g. ".../upload/w_800/..."): leave as is.
  if (/^[a-z]{1,3}_[^/]+\//.test(after) && !/^v\d+\//.test(after)) return url;

  return `${before}/upload/f_auto,q_auto,c_limit,w_${width}/${after}`;
}
