import { ImageIcon } from "lucide-react";

export default function ProductSkeleton() {
  return (
    <div className="p-4 overflow-hidden bg-white border shadow-sm group rounded-4xl border-black/5">
      {/* Image Area */}
      <div className="relative flex items-center justify-center w-full overflow-hidden aspect-4/5 rounded-2xl bg-black/5 animate-shimmer">
        <ImageIcon className="w-12 h-12 text-black/5" />
      </div>

      {/* Content Area */}
      <div className="py-4 space-y-3">
        {/* Rating and Reviews */}
        <div className="flex items-center gap-2">
            <div className="w-16 h-4 rounded-full bg-black/5 animate-shimmer" />
            <div className="w-12 h-4 rounded-full bg-black/5 animate-shimmer" />
        </div>

        {/* Name */}
        <div className="w-3/4 h-6 rounded-lg bg-black/5 animate-shimmer" />

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col gap-1">
            <div className="w-20 h-6 rounded bg-black/5 animate-shimmer" />
            <div className="w-16 h-4 rounded bg-black/5 animate-shimmer" />
          </div>
          <div className="w-10 h-10 rounded-full bg-black/5 animate-shimmer" />
        </div>
      </div>
    </div>
  );
}
