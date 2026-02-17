"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { Filters } from "@/app/shop/ShopClient";

interface Variant {
  _id: string;
  finalPrice: number;
  sellingPrice: number;
  discount?: {
    type: "PERCENT" | "FLAT";
    value?: number;
  };
  weight: {
    value: number;
    unit: string;
  };
  images: {
    url: string;
  }[];
}

interface Product {
  _id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  variants: Variant[];
}

interface Params {
  page: number;
  limit: number;
  sort: string;
  filters: Filters;
}

export default function useShopProducts({
  page,
  limit,
  sort,
  filters,
}: Params) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  /**
   * 🔑 Stable filters key
   */
  const filtersKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  );

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await api.get("/customer/products", {
          params: {
            page,
            limit,
            sort,
            available: filters.available,
            teaType: filters.teaTypes,
            weight: filters.weight,
            unit: filters.weight ? "g" : undefined,
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
          },
        });

        if (!active) return;

        setProducts(res.data.products || []);
        setTotal(res.data.total || 0);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, [page, limit, sort, filtersKey, filters.available, filters.teaTypes, filters.weight, filters.minPrice, filters.maxPrice]);

  return { products, total, loading };
}
