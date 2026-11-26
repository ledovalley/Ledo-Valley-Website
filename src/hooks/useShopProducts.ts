"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import type { Filters } from "@/app/shop/ShopClient";
import { shopRequestKey } from "@/lib/shopKey";

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

export interface ShopProduct {
  _id: string;
  slug: string;
  name: string;
  rating: number;
  reviewCount: number;
  variants: Variant[];
}

type Product = ShopProduct;

export interface InitialShopData {
  /** Which request this data answers, e.g. page 1, newest, no filters. */
  key: string;
  products: Product[];
  total: number;
}

interface Params {
  page: number;
  limit: number;
  sort: string;
  filters: Filters;
  /** First page from the server (cached); used instead of a browser request when it matches. */
  initial?: InitialShopData;
}



export default function useShopProducts({
  page,
  limit,
  sort,
  filters,
  initial,
}: Params) {
  const requestKey = shopRequestKey(page, limit, sort, filters);
  const usableInitial = initial && initial.key === requestKey ? initial : undefined;

  const [products, setProducts] = useState<Product[]>(usableInitial?.products ?? []);
  const [total, setTotal] = useState(usableInitial?.total ?? 0);
  const [loading, setLoading] = useState(false);
  // Skip the browser request only for the very first render when the server already sent it.
  const skipFirstFetch = useRef(!!usableInitial);

  /**
   * 🔑 Stable filters key
   */
  const filtersKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  );

  useEffect(() => {
    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    let active = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        params.set("sort", sort);

        if (filters.available !== undefined) {
          params.set("available", String(filters.available));
        }

        filters.teaTypes.forEach((teaType) => {
          params.append("teaType", teaType);
        });

        if (filters.weight !== undefined) {
          params.set("weight", String(filters.weight));
          params.set("unit", "g");
        }

        if (filters.minPrice !== undefined) {
          params.set("minPrice", String(filters.minPrice));
        }

        if (filters.maxPrice !== undefined) {
          params.set("maxPrice", String(filters.maxPrice));
        }

        if (filters.search) {
          params.set("search", filters.search);
        }

        const res = await api.get("/customer/products", {
          params,
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
  }, [page, limit, sort, filtersKey, filters.available, filters.teaTypes, filters.weight, filters.minPrice, filters.maxPrice, filters.search]);

  return { products, total, loading };
}
