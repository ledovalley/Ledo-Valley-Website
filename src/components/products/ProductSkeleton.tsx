import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="group overflow-hidden rounded-[2rem] bg-white p-4 shadow-sm border border-black/5 animate-pulse">
      {/* Image Area */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-black/5" />

      {/* Content Area */}
      <div className="py-4 space-y-3">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
            <div className="h-4 w-16 rounded bg-black/5" />
            <div className="h-4 w-12 rounded bg-black/5" />
        </div>

        {/* Name */}
        <div className="h-6 w-3/4 rounded-lg bg-black/5" />

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <div className="h-6 w-20 rounded bg-black/10" />
            <div className="h-4 w-16 rounded bg-black/5" />
          </div>
          <div className="h-10 w-10 rounded-full bg-black/10" />
        </div>
      </div>
    </div>
  );
}
