"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";

interface Props {
  page: number;
  limit: number;
  total: number;
  sort: string;
  onSortChange: (value: string) => void;
  onOpenMobileFilters: () => void; // 👈 new prop
}

export default function ShopToolbar({
  page,
  limit,
  total,
  sort,
  onSortChange,
  onOpenMobileFilters,
}: Props) {
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-end gap-8">

      {/* LEFT SIDE */}
      <div className="flex items-center justify-between w-full sm:w-auto">

        {/* Mobile Filter Button */}
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 px-4 py-2 mr-8 lg:mr-0 rounded-full border text-sm font-medium"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        {/* Product Count */}
        <p className="hidden sm:block text-sm text-gray-500 font-medium ml-auto sm:ml-0">
          Showing{" "}
          <span className="text-gray-900">
            {start}–{end}
          </span>{" "}
          of{" "}
          <span className="text-gray-900">{total}</span>{" "}
          products
        </p>
      </div>

      {/* SORT */}
      <div className="flex items-center gap-3">
        <label
          htmlFor="sort"
          className="text-sm font-medium text-gray-500 whitespace-nowrap"
        >
          Sort by:
        </label>

        <div className="relative group">
          <select
            id="sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none text-gray-700 text-sm rounded-xl pr-6 py-2.5 font-semibold cursor-pointer"
          >
            <option value="newest">Newest Arrival</option>
            <option value="popular">Most Popular</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>

          <ChevronDown
            size={16}
            className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}