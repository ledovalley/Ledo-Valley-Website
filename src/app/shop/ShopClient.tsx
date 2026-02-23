"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import ShopBanner from "@/components/shop/ShopBanner";
import ShopToolbar from "@/components/shop/ShopToolbar";
import ShopFilters from "@/components/shop/ShopFilters";
import ShopProducts from "@/components/shop/ShopProducts";
import ShopPagination from "@/components/shop/ShopPagination";
import ShopFAQ from "@/components/shop/ShopFAQ";

import useShopProducts from "@/hooks/useShopProducts";

export interface Filters {
  available?: boolean;
  teaTypes: string[];
  weight?: number;
  minPrice?: number;
  maxPrice?: number;
}

export default function ShopClient() {
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
    maxPrice: 4000,
  });

  /* ================= APPLIED FILTER STATE (used for API) ================= */

  const [filters, setFilters] = useState<Filters>({
    teaTypes: teaTypeFromUrl ? [teaTypeFromUrl] : [],
  });

  const limit = 9;

  const { products, total, loading } = useShopProducts({
    page,
    limit,
    sort,
    filters,
  });

  return (
    <div className="bg-bg-page">
      <ShopBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">

        {/* ================= TOOLBAR ================= */}
        <div className="flex flex-col gap-4">
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
            <div className="flex justify-between items-center p-8 border-b border-border-muted/20">
              <h3 className="text-lg font-semibold">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}>
                <X />
              </button>
            </div>

            {/* FILTER CONTENT */}
            <div className="flex-1 overflow-y-auto p-8">
              <ShopFilters
                groupId="mobile"   // 👈 IMPORTANT
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