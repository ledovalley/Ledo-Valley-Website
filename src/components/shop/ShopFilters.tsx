"use client";

import { useState } from "react";
import { X } from "lucide-react";

const TEA_TYPES = ["Green", "Black", "Herbal"];
const WEIGHTS = [
  { label: "100g", value: 100 },
  { label: "250g", value: 250 },
  { label: "500g", value: 500 },
  { label: "750g", value: 750 },
  { label: "1kg", value: 1000 },
];

interface Filters { 
  available?: boolean;
  teaTypes: string[];
  weight?: number;
  minPrice?: number;
  maxPrice?: number;
}

interface Props {
  onApply: (filters: Filters) => void;
}

export default function ShopFilters({ onApply }: Props) {
  const [inStock, setInStock] = useState(false);
  const [teaTypes, setTeaTypes] = useState<string[]>([]);
  const [weight, setWeight] = useState<number | undefined>();
  const [price, setPrice] = useState(4000);

  const toggleTeaType = (type: string) => {
    setTeaTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const applyFilters = () => {
    onApply({
      available: inStock || undefined,
      teaTypes,
      weight,
      minPrice: 0,
      maxPrice: price,
    });
  };

  const clearFilters = () => {
    setInStock(false);
    setTeaTypes([]);
    setWeight(undefined);
    setPrice(4000);

    onApply({
      teaTypes: [],
    });
  };

  return (
    <div className="border border-border-muted p-6 rounded-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Filters</h3>

        <button
          onClick={clearFilters}
          className="text-sm flex items-center gap-1 hover:cursor-pointer hover:font-medium text-text-secondary hover:text-text-primary transition"
        >
          <X size={14} />
          Clear
        </button>
      </div>

      {/* Availability */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Availability</h4>

        <label className="flex items-center justify-between text-sm">
          <span>In stock</span>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
        </label>
      </div>

      {/* Tea Type */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Tea Type</h4>

        {TEA_TYPES.map((type) => (
          <label
            key={type}
            className="flex items-center justify-between text-sm mb-2"
          >
            <span>{type}</span>
            <input
              type="checkbox"
              checked={teaTypes.includes(type)}
              onChange={() => toggleTeaType(type)}
            />
          </label>
        ))}
      </div>

      {/* Weight */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Weight</h4>

        {WEIGHTS.map((w) => (
          <label
            key={w.value}
            className="flex items-center justify-between text-sm mb-2"
          >
            <span>{w.label}</span>
            <input
              type="radio"
              name="weight"
              checked={weight === w.value}
              onChange={() => setWeight(w.value)}
            />
          </label>
        ))}
      </div>

      {/* Price */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3">Price</h4>

        <input
          type="range"
          min={0}
          max={4000}
          step={50}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full accent-(--color-brand-primary)"
        />

        <div className="flex justify-between text-sm text-text-secondary">
          <span>₹0</span>
          <span>₹{price}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={applyFilters}
          className="
            flex-1 py-2 rounded-full text-sm font-medium
            bg-bg-dark text-text-on-dark
            hover:bg-bg-dark/90 transition hover:cursor-pointer 
          "
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
