"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ImageType {
    url: string;
}

interface Variant {
    _id: string;
    images: ImageType[];
}

interface Props {
    variants: Variant[];
    selectedVariantId: string;
}

export default function ProductImages({
    variants,
    selectedVariantId,
}: Props) {
    const variant =
        variants.find((v) => v._id === selectedVariantId) ||
        variants[0];

    const images = variant?.images || [];

    return (
        <ImageGallery
            key={selectedVariantId} // this already resets state
            images={images}
        />
    );
}

/* ============================= */

function ImageGallery({
    images,
}: {
    images: { url: string }[];
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    if (!images.length) return null;

    const visibleThumbnails = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
        <>
            <div
                className="
                    flex flex-col-reverse
                    lg:flex-row
                    gap-4 lg:gap-6
                    items-start
                    min-w-0
                "
            >
                {/* ================= THUMBNAILS ================= */}
                <div className="w-full min-w-0 lg:w-auto">
                    <div
                        className="
                            flex lg:flex-col
                            gap-3
                            pb-2 lg:pb-0
                            w-full
                            min-w-0
                        "
                    >
                        {visibleThumbnails.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedIndex(i)}
                                className={`
                                    relative
                                    w-20 h-20
                                    sm:w-24 sm:h-24
                                    shrink-0
                                    rounded-xl overflow-hidden border transition
                                    ${selectedIndex === i
                                        ? "border-bg-dark"
                                        : "border-border-muted hover:border-bg-dark/40"
                                    }
                                `}
                            >
                                <Image
                                    src={img.url}
                                    alt="Thumbnail"
                                    fill
                                    sizes="96px"
                                    className="object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* ================= MAIN IMAGE ================= */}
                <div
                    onClick={() => setShowModal(true)}
                    className="
                        relative w-full
                        aspect-square
                        rounded-2xl
                        overflow-hidden
                        bg-bg-surface
                        cursor-zoom-in
                    "
                >
                    <Image
                        src={images[selectedIndex]?.url}
                        alt="Product"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                    />
                </div>
            </div>

            {/* ================= MODAL ================= */}
            {showModal && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="
                            relative
                            w-full max-w-5xl
                            bg-bg-page
                            rounded-2xl
                            p-4 sm:p-6
                            max-h-[95vh]
                            flex flex-col
                        "
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 cursor-pointer right-4 z-10 hover:bg-bg-surface/80 backdrop-blur rounded-full p-2 hover:opacity-70 transition"
                        >
                            <X size={20} />
                        </button>

                        {/* MAIN IMAGE */}
                        <div className="relative w-full flex-1 min-h-75 sm:min-h-100">
                            <Image
                                src={images[selectedIndex]?.url}
                                alt="Product Preview"
                                fill
                                sizes="100vw"
                                className="object-contain"
                            />
                        </div>

                        {/* NAVIGATION ARROWS */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() =>
                                        setSelectedIndex((prev) =>
                                            prev === 0 ? images.length - 1 : prev - 1
                                        )
                                    }
                                    className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 bg-bg-surface/80 backdrop-blur p-2 rounded-full"
                                >
                                    ‹
                                </button>

                                <button
                                    onClick={() =>
                                        setSelectedIndex((prev) =>
                                            prev === images.length - 1 ? 0 : prev + 1
                                        )
                                    }
                                    className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 bg-bg-surface/80 backdrop-blur p-2 rounded-full"
                                >
                                    ›
                                </button>
                            </>
                        )}

                        {/* THUMBNAILS */}
                        {images.length > 1 && (
                            <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedIndex(i)}
                                        className={`
                                            relative
                                            w-16 h-16 sm:w-20 sm:h-20
                                            shrink-0
                                            rounded-xl
                                            overflow-hidden
                                            border
                                            ${selectedIndex === i
                                                ? "border-black"
                                                : "border-gray-200"
                                            }
                                        `}
                                    >
                                        <Image
                                            src={img.url}
                                            alt="Thumbnail"
                                            fill
                                            sizes="80px"
                                            className="object-contain p-1"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}