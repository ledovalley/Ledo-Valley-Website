"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import ShopBanner, { type ShopBannerData } from "@/components/shop/ShopBanner";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopProducts from "@/components/shop/ShopProducts";
import ShopPagination from "@/components/shop/ShopPagination";
import ShopFAQ from "@/components/shop/ShopFAQ";

import useShopProducts, { type InitialShopData } from "@/hooks/useShopProducts";
import type { ShopFacets } from "@/lib/shopFacets";

export interface Filters {
  available?: boolean;
  teaTypes: string[];
  weight?: number;
  minPrice?: number;
  maxPrice?: number;
  /** Words typed in the search box (only set when there are some). */
  search?: string;
}

export default function ShopClient({
  initialProducts,
  initialBanners,
  facets,
}: {
  /** Page 1 / newest / no filters, from the server (cached). */
  initialProducts?: InitialShopData;
  /** Default shop banners, from the server (cached). */
  initialBanners?: ShopBannerData[];
  /** Pack sizes and price range actually on sale (for the filters). */
  facets?: ShopFacets;
} = {}) {
  const priceMax = facets?.priceMax ?? 4000;
  const searchParams = useSearchParams();
  const teaTypeFromUrl = searchParams.get("teaType");

  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  /* ================= UI FILTER STATE (controls inputs) ================= */

  const [uiFilters, setUiFilters] = useState<Filters>({
    available: false,
    teaTypes: teaTypeFromUrl ? [teaTypeFromUrl] : [],
    weight: undefined,
    minPrice: 0,
    maxPrice: priceMax,
  });

  /* ================= APPLIED FILTER STATE (used for API) ================= */

  const [filters, setFilters] = useState<Filters>({
    teaTypes: teaTypeFromUrl ? [teaTypeFromUrl] : [],
  });

  const limit = 9;

  /* ================= SEARCH (waits until typing pauses) ================= */
  // ?q= or ?search= (the address Google shows for searching the site).
  const [searchText, setSearchText] = useState(searchParams.get("q") || searchParams.get("search") || "");

  useEffect(() => {
    const id = window.setTimeout(() => {
      const q = searchText.trim().slice(0, 60);
      setFilters((prev) => {
        if ((prev.search || "") === q) return prev;
        const next = { ...prev };
        if (q) next.search = q;
        else delete next.search;
        return next;
      });
      setPage(1);
    }, 400);
    return () => window.clearTimeout(id);
  }, [searchText]);

  const { products, total, loading } = useShopProducts({
    page,
    limit,
    sort,
    filters,
    initial: initialProducts,
  });

  return (
    <div className="bg-bg-page">
      <ShopBanner teaType={teaTypeFromUrl} initialBanners={initialBanners} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* ================= TOOLBAR ================= */}
        <div className="flex flex-col gap-4">
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="relative w-full sm:max-w-md"
          >
            <label htmlFor="shop-search" className="sr-only">Search teas</label>
            <Search className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-text-secondary" />
            <input
              id="shop-search"
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search teas, e.g. green, CTC, gift"
              autoComplete="off"
              className="w-full py-3 pr-10 text-sm border rounded-full outline-none pl-11 border-border-muted/40 bg-bg-surface focus:border-bg-dark"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText("")}
                aria-label="Clear search"
                className="absolute p-1 -translate-y-1/2 rounded-full right-3 top-1/2 text-text-secondary hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
          {filters.search && !loading && (
            <p className="text-sm text-text-secondary" aria-live="polite">
              {total === 0
                ? <>No teas match &ldquo;{filters.search}&rdquo;. Try another word, or <button type="button" onClick={() => setSearchText("")} className="underline">see all teas</button>.</>
                : <>{total} tea{total === 1 ? "" : "s"} for &ldquo;{filters.search}&rdquo;</>}
            </p>
          )}
          <ShopToolbar
            page={page}
            limit={limit}
            total={total}
            sort={sort}
            onSortChange={(value) => {
              setPage(1);
              setSort(value);
            }}
            onOpenMobileFilters={() => setMobileFiltersOpen(true)}
          />
        </div>

        {/* ================= MAIN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

          {/* Desktop Filters */}
          <aside className="hidden lg:block lg:col-span-3">
            <ShopFilters
              groupId="desktop"   // 👈 IMPORTANT
              weightOptions={facets?.weights}
              priceMax={priceMax}
              filters={uiFilters}
              setFilters={setUiFilters}
              onApply={(newFilters) => {
                setPage(1);
                setFilters(newFilters);
              }}
            />
          </aside>

          {/* Products */}
          <section className="lg:col-span-9">
            <ShopProducts products={products} loading={loading} />

            <ShopPagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
            />
          </section>
        </div>
      </div>

      {/* ================= MOBILE FILTER DRAWER ================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end">

          <div className="w-full max-w-sm bg-bg-surface h-full shadow-xl flex flex-col">

            {/* HEADER */}
            <div className="flex justify-between items-center p-5 sm:p-8 border-b border-border-muted/20">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters" className="p-2 -m-2">
                <X />
              </button>
            </div>

            {/* FILTER CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-8">
              <ShopFilters
                groupId="mobile"   // 👈 IMPORTANT
                weightOptions={facets?.weights}
                priceMax={priceMax}
                filters={uiFilters}
                setFilters={setUiFilters}
                onApply={(newFilters) => {
                  setPage(1);
                  setFilters(newFilters);
                  setMobileFiltersOpen(false);
                }}
              />
            </div>

          </div>
        </div>
      )}

      <ShopFAQ />
    </div>
  );
}