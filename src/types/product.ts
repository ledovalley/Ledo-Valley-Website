/* ============================
   SHARED ENUMS
============================ */

export type TeaWeightUnit = "g" | "kg";
export type ProductStatus = "ACTIVE" | "OUT_OF_STOCK";

/* ============================
   PRODUCT IMAGE
============================ */

export interface ProductImage {
  url: string;
  isDefault: boolean;
}

/* ============================
   PRODUCT VARIANT
============================ */

export interface ProductVariant {
  id: string;

  attributes: {
    weight: {
      value: number;
      unit: TeaWeightUnit;
    };
  };

  price: number;
  mrp?: number;

  stock: number;
  status: ProductStatus;
  isDefault: boolean;
}

/* ============================
   PRODUCT LIST ITEM
   (Shop / Home / Top Sellers)
============================ */

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;

  shortDescription?: string;
  image?: string | null;

  price: number;
  mrp?: number;

  averageRating?: number;
  ratingsCount?: number;

  isFeatured?: boolean;
  createdAt?: string;
}

/* ============================
   PRODUCT DETAILS
   (Single Product Page)
============================ */

export interface ProductDetails {
  id: string;
  name: string;
  description: string;

  images: ProductImage[];
  variants: ProductVariant[];

  averageRating: number;
  ratingsCount: number;

  seo?: {
    title?: string;
    description?: string;
  };
}
