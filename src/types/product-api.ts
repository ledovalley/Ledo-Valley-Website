export interface Variant {
  _id: string;
  weight: { value: number; unit: string };
  sellingPrice: number;
  finalPrice: number;
  stock: number;
  availability: boolean;
  images: { url: string; publicId?: string }[];
  discount: { type: "PERCENT" | "FLAT"; value: number };
}

export interface Review {
  _id: string;
  customerName: string;
  rating: number;
  review: string;
  createdAt: string;
  image?: { url: string };
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  bestFor: string[];
  teaType: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  variants: Variant[];
  reviews: Review[];
}
