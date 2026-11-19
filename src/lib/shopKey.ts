import type { Filters } from "@/app/shop/ShopClient";

/*
 * Identifies one shop product request. Used by the server (shop/page.tsx)
 * and the browser (useShopProducts) to tell whether the server's cached
 * first page answers the browser's current request.
 * Kept outside "use client" files so the server can call it.
 */
export const shopRequestKey = (page: number, limit: number, sort: string, filters: Filters) =>
  JSON.stringify({ page, limit, sort, filters });
