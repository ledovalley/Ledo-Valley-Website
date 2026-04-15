import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="p-4 overflow-hidden bg-white border shadow-sm group rounded-4xl border-black/5 animate-pulse">
      {/* Image Area */}
      <div className="relative w-full overflow-hidden aspect-4/5 rounded-2xl bg-black/5" />

      {/* Content Area */}
      <div className="py-4 space-y-3">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
            <div className="w-16 h-4 rounded bg-black/5" />
            <div className="w-12 h-4 rounded bg-black/5" />
        </div>

        {/* Name */}
        <div className="w-3/4 h-6 rounded-lg bg-black/5" />

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <div className="w-20 h-6 rounded bg-black/10" />
            <div className="w-16 h-4 rounded bg-black/5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-black/10" />
        </div>
      </div>
    </div>
  );
}
