import { useEffect, useState } from "react";
import api from "@/lib/api";

export interface Variant {
  _id: string;
  finalPrice: number;
  sellingPrice: number;
  discount?: {
    type: "PERCENT" | "FLAT";
    value: number;
  };
  weight: {
    value: number;
    unit: string;
  };
  images: { url: string }[];
}

export interface Product {
  _id: string;
  slug: string;        // ✅ ADD THIS
  name: string;
  rating: number;
  reviewCount: number; // ✅ ADD THIS
  variants: Variant[];
}

export default function useTopSellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/customer/products", {
        params: {
          sort: "popular",   // ⚠️ IMPORTANT
          limit: 3,
        },
      })
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, loading };
}
