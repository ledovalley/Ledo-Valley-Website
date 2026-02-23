"use client";

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
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  onApply: (filters: Filters) => void;
  groupId?: string; // 👈 NEW
}

export default function ShopFilters({
  filters,
  setFilters,
  onApply,
  groupId = "default",
}: Props) {

  const toggleTeaType = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      teaTypes: prev.teaTypes.includes(type)
        ? prev.teaTypes.filter((t) => t !== type)
        : [...prev.teaTypes, type],
    }));
  };

  const applyFilters = () => {
    onApply(filters);
  };

  const clearFilters = () => {
    const cleared: Filters = {
      available: false,
      teaTypes: [],
      weight: undefined,
      minPrice: 0,
      maxPrice: 4000,
    };

    setFilters(cleared);
    onApply({ teaTypes: [] });
  };

  return (
    <div className="flex flex-col h-full lg:h-auto bg-bg-surface/50 lg:border lg:border-border-muted/20 lg:p-6 rounded-3xl">

      {/* ================= SCROLLABLE CONTENT ================= */}
      <div className="flex-1 overflow-y-auto lg:overflow-visible">

        {/* Header (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Filters</h3>

          <button
            onClick={clearFilters}
            className="text-sm flex items-center gap-1 hover:font-medium text-text-secondary hover:text-text-primary transition"
          >
            <X size={14} />
            Clear
          </button>
        </div>

        {/* Availability */}
        <div className="mb-6 lg:px-0">
          <h4 className="font-semibold mb-3">Availability</h4>

          <label className="flex items-center justify-between text-sm">
            <span>In stock</span>
            <input
              type="checkbox"
              checked={filters.available || false}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  available: e.target.checked,
                }))
              }
            />
          </label>
        </div>

        {/* Tea Type */}
        <div className="mb-6 lg:px-0">
          <h4 className="font-semibold mb-3">Tea Type</h4>

          {TEA_TYPES.map((type) => (
            <label
              key={type}
              className="flex items-center justify-between text-sm mb-2"
            >
              <span>{type}</span>
              <input
                type="checkbox"
                checked={filters.teaTypes.includes(type)}
                onChange={() => toggleTeaType(type)}
              />
            </label>
          ))}
        </div>

        {/* Weight */}
        <div className="mb-6 lg:px-0">
          <h4 className="font-semibold mb-3">Weight</h4>

          {WEIGHTS.map((w) => (
            <label
              key={w.value}
              className="flex items-center justify-between text-sm mb-2"
            >
              <span>{w.label}</span>
              <input
                type="radio"
                name={`weight-${groupId}`}
                checked={filters.weight === w.value}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    weight: w.value,
                  }))
                }
              />
            </label>
          ))}
        </div>

        {/* Price */}
        <div className="mb-6 lg:px-0">
          <h4 className="font-semibold mb-3">Price</h4>

          <input
            type="range"
            min={0}
            max={4000}
            step={50}
            value={filters.maxPrice || 4000}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                maxPrice: Number(e.target.value),
              }))
            }
            className="w-full accent-(--color-brand-primary)"
          />

          <div className="flex justify-between text-sm text-text-secondary">
            <span>₹0</span>
            <span>₹{filters.maxPrice || 4000}</span>
          </div>
        </div>

      </div>

      {/* ================= BOTTOM ACTIONS ================= */}
      <div className="mt-auto p-4 lg:p-0 border-t lg:border-0 bg-bg-surface">
        <div className="flex gap-3">

          <button
            onClick={clearFilters}
            className="lg:hidden flex-1 py-2 rounded-full text-sm border"
          >
            Clear
          </button>

          <button
            onClick={applyFilters}
            className="flex-1 py-2 rounded-full text-sm font-medium bg-bg-dark text-text-on-dark hover:bg-bg-dark/90 transition"
          >
            Apply Filters
          </button>

        </div>
      </div>

    </div>
  );
}