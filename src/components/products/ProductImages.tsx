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

    // 👇 key-based reset trick
    return (
        <ImageGallery
            key={selectedVariantId} // forces clean reset
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

    const thumbnailCount = Math.max(images.length, 3);
    const isManyImages = images.length > 3;

    const visibleThumbnails = images.slice(0, 3);
    const remainingCount = images.length - 3;

    return (
        <>
            <div className="flex gap-6 items-start">
                {/* Thumbnails */}
                <div className="flex flex-col gap-4">
                    {visibleThumbnails.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            className={`
                relative 
                ${isManyImages ? "w-20 h-20" : "w-28 h-28"}
                rounded-xl overflow-hidden border transition
                ${selectedIndex === i
                                    ? "border-bg-dark"
                                    : "border-border-muted"
                                }
              `}
                        >
                            <Image
                                src={img.url}
                                alt="Thumbnail"
                                fill
                                className="object-contain"
                            />
                        </button>
                    ))}

                    {/* Show +X only if more than 3 */}
                    {remainingCount > 0 && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-20 h-20 rounded-xl border border-border-muted text-sm flex items-center justify-center"
                        >
                            +{remainingCount}
                        </button>
                    )}
                </div>

                {/* Main Image */}
                <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-bg-surface">
                    <Image
                        src={images[selectedIndex].url}
                        alt="Product"
                        fill
                        className="object-contain p-10"
                    />
                </div>
            </div>
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl max-w-4xl w-full relative">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4"
                        >
                            <X />
                        </button>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {images.map((img, i) => (
                                <div
                                    key={i}
                                    className="relative aspect-square rounded-lg overflow-hidden"
                                >
                                    <Image
                                        src={img.url}
                                        alt="Gallery"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
