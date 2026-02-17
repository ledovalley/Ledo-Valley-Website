"use client";

interface Props {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
}

export default function ShopPagination({
    page,
    limit,
    total,
    onPageChange,
}: Props) {
    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) return null;

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className="flex justify-center items-center gap-2 mt-12">
            {/* Previous */}
            <button
                disabled={page === 1}
                onClick={() => onPageChange(page - 1)}
                className={`px-3 py-2 text-sm rounded border transition
          ${page === 1
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "hover:bg-bg-surface"
                    }`}
            >
                Previous
            </button>

            {/* Page Numbers */}
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-3 py-2 text-sm rounded border transition
            ${p === page
                            ? "bg-bg-dark text-text-on-dark border-bg-dark"
                            : "hover:bg-bg-surface"
                        }`}
                >
                    {p}
                </button>
            ))}

            {/* Next */}
            <button
                disabled={page === totalPages}
                onClick={() => onPageChange(page + 1)}
                className={`px-3 py-2 text-sm rounded border transition
          ${page === totalPages
                        ? "text-gray-400 border-gray-200 cursor-not-allowed"
                        : "hover:bg-bg-surface"
                    }`}
            >
                Next
            </button>
        </div>
    );
}
