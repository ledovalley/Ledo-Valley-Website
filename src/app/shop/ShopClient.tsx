"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <ShopToolbar
          page={page}
          limit={limit}
          total={total}
          sort={sort}
          onSortChange={(value) => {
            setPage(1);
            setSort(value);
          }}
        />

        <div className="grid grid-cols-12 gap-10 mt-8">
          <aside className="col-span-12 lg:col-span-3">
            <ShopFilters
              onApply={(filters) => {
                setPage(1);
                setFilters(filters);
              }}
            />
          </aside>

          <section className="col-span-12 lg:col-span-9">
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

      <ShopFAQ />
    </div>
  );
}
