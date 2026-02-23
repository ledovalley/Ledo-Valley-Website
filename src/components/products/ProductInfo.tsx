"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useUI } from "@/context/UIContext";
import { MinusIcon, PlusIcon } from "lucide-react";
import { useState, useMemo } from "react";

interface Variant {
    _id: string;
    weight: {
        value: number;
        unit: string;
    };
    sellingPrice: number;
    finalPrice: number;
    discount?: {
        type: "PERCENT" | "FLAT";
        value?: number;
    };
    stock: number;
    images?: { url: string }[];
}

interface Product {
    _id: string;
    slug: string;
    name: string;
    description: string;
    bestFor: string[];
    rating: number;
    reviewCount: number;
    variants: Variant[];
}

interface Props {
    product: Product;
    selectedVariantId: string;
    onVariantChange: (id: string) => void;
}

/* ================= RATING ================= */

function RatingStars({
    rating,
    reviewCount,
}: {
    rating: number;
    reviewCount: number;
}) {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const isFull = rating >= star;
                const isHalf = rating >= star - 0.5 && rating < star;

                return (
                    <span key={star} className="relative w-4 h-4">
                        <span className="absolute inset-0 text-gray-300">★</span>
                        {isFull && (
                            <span className="absolute inset-0 text-yellow-400">★</span>
                        )}
                        {isHalf && (
                            <span
                                className="absolute inset-0 text-yellow-400 overflow-hidden"
                                style={{ width: "50%" }}
                            >
                                ★
                            </span>
                        )}
                    </span>
                );
            })}

            <span className="ml-2 text-sm text-text-secondary">
                {rating.toFixed(1)} ({reviewCount})
            </span>
        </div>
    );
}

/* ================= COMPONENT ================= */
export default function ProductInfo({
    product,
    selectedVariantId,
    onVariantChange,
}: Props) {
    const selectedVariant =
        product.variants.find((v) => v._id === selectedVariantId) ||
        product.variants[0];

    const isOutOfStock = selectedVariant.stock <= 0;

    const discountPercent = useMemo(() => {
        if (!selectedVariant.sellingPrice) return 0;
        const diff =
            selectedVariant.sellingPrice - selectedVariant.finalPrice;

        return Math.round(
            (diff / selectedVariant.sellingPrice) * 100
        );
    }, [selectedVariant]);

    return (
        <div className="w-full min-w-0">
            <div
                className="
                    flex flex-col gap-2
                    overflow-x-auto sm:overflow-visible
                    pb-2 sm:pb-0
                "
            >

                {/* ================= TOP CONTENT ================= */}
                <div className="space-y-4 sm:space-y-6">

                    {/* Stock Badge */}
                    <div>
                        {isOutOfStock ? (
                            <span className="text-xs bg-red-500/10 text-red-500 px-3 py-1 rounded-full font-medium">
                                Out of Stock
                            </span>
                        ) : selectedVariant.stock <= 5 ? (
                            <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-medium">
                                Only {selectedVariant.stock} left
                            </span>
                        ) : (
                            <span className="text-xs bg-green-600/10 text-green-600 px-3 py-1 rounded-full font-medium">
                                In Stock
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-playfair font-semibold leading-tight text-brand-primary">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <RatingStars
                        rating={product.rating}
                        reviewCount={product.reviewCount}
                    />

                    {/* Pricing */}
                    <div className="flex flex-wrap items-end gap-3 sm:gap-4">

                        <span className="text-brand-primary text-2xl sm:text-3xl lg:text-4xl font-extrabold">
                            ₹{selectedVariant.finalPrice.toFixed(0)}
                        </span>

                        {discountPercent > 0 && (
                            <>
                                <span className="text-sm sm:text-lg line-through text-text-secondary/40">
                                    ₹{selectedVariant.sellingPrice}
                                </span>

                                <span className="text-xs bg-warning/10 text-warning px-3 py-1 rounded-full font-medium">
                                    {discountPercent}% OFF
                                </span>
                            </>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xl">
                        {product.description}
                    </p>

                    {/* Best For */}
                    {product.bestFor?.length > 0 && (
                        <div className="text-sm text-text-secondary">
                            <span className="font-medium">Best For:</span>{" "}
                            {product.bestFor.join(", ")}
                        </div>
                    )}
                </div>

                {/* ================= VARIANT + CART ================= */}
                <div className="mt-8 sm:mt-auto pt-8 sm:pt-10 space-y-6">

                    {/* Weight Selection */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">
                            Choose Weight
                        </h4>

                        <div className="
                            flex flex-wrap gap-2
                            w-full
                        "
                        >
                            {product.variants.map((variant) => (
                                <button
                                    key={variant._id}
                                    onClick={() => onVariantChange(variant._id)}
                                    className={`
                                    shrink-0
                                    px-4 sm:px-6 
                                    py-2 sm:py-2.5 
                                    text-xs sm:text-sm 
                                    rounded-full transition border cursor-pointer
                                    ${selectedVariant._id === variant._id
                                            ? "bg-bg-dark text-white border-bg-dark"
                                            : "border-border-muted hover:border-bg-dark/60"
                                        }
                                `}
                                >
                                    {variant.weight.value}
                                    {variant.weight.unit}
                                </button>
                            ))}
                        </div>
                    </div>

                    <QuantitySection
                        key={selectedVariantId}
                        productId={product._id}
                        slug={product.slug}
                        name={product.name}
                        variantId={selectedVariant._id}
                        price={selectedVariant.finalPrice}
                        image={selectedVariant.images?.[0].url || ""}
                        weightLabel={`${selectedVariant.weight.value}${selectedVariant.weight.unit}`}
                        stock={selectedVariant.stock}
                        isOutOfStock={isOutOfStock}
                    />
                </div>
            </div>
        </div>
    );
}

/* ================= QUANTITY SUB COMPONENT ================= */
function QuantitySection({
    productId,
    slug,
    name,
    variantId,
    price,
    image,
    weightLabel,
    stock,
    isOutOfStock,
}: {
    productId: string;
    slug: string;
    name: string;
    variantId: string;
    price: number;
    image: string;
    weightLabel: string;
    stock: number;
    isOutOfStock: boolean;
}) {
    const { addToCart } = useCart();
    const { isLoggedIn } = useAuth();
    const { openLogin } = useUI();

    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    const handleAdd = async () => {
        if (isOutOfStock || adding) return;

        if (!isLoggedIn) {
            openLogin();
            return;
        }

        try {
            setAdding(true);

            await addToCart({
                productId,
                variantId,
                name,
                slug,
                image,
                weightLabel,
                quantity,
                priceAtAdd: price,
            });

            setQuantity(1);
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="flex flex-row gap-4 w-full">
            {!isOutOfStock && (
                <div className="
                        flex items-center justify-between
                        border border-bg-dark
                        rounded-full h-fit
                        w-fit gap-8
                    "
                >
                    <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={adding}
                        className="p-3 rounded-l-full disabled:opacity-40 cursor-pointer hover:bg-bg-surface"
                    >
                        <MinusIcon size={18} />
                    </button>

                    <span className="font-medium text-sm sm:text-base">
                        {quantity}
                    </span>

                    <button
                        onClick={() =>
                            setQuantity((q) => Math.min(stock, q + 1))
                        }
                        disabled={adding}
                        className="p-3 rounded-r-full disabled:opacity-40 cursor-pointer hover:bg-bg-surface"
                    >
                        <PlusIcon size={18} />
                    </button>
                </div>
            )}

            <button
                onClick={handleAdd}
                disabled={isOutOfStock || adding}
                className={`
                    w-full py-3 h-fit
                    rounded-full
                    font-medium
                    transition cursor-pointer
                    ${isOutOfStock
                        ? "bg-gray-300 cursor-not-allowed"
                        : adding
                            ? "bg-bg-dark/70 text-white"
                            : "bg-bg-dark text-white hover:bg-bg-dark/90"
                    }
                `}
            >
                {isOutOfStock
                    ? "Out of Stock"
                    : adding
                        ? "Adding..."
                        : "Add to Cart"}
            </button>
        </div>
    );
}
