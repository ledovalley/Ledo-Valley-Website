"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { createPortal } from "react-dom";

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
        variants.find((v) => v._id === selectedVariantId) || variants[0];

    const images = variant?.images || [];

    return <ImageGallery key={selectedVariantId} images={images} />;
}

function ImageGallery({
    images,
}: {
    images: { url: string }[];
}) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    const goPrev = useCallback(() => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const goNext = useCallback(() => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    useEffect(() => {
        if (!showModal) return;

        closeButtonRef.current?.focus();

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setShowModal(false);
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        window.addEventListener("keydown", onKeyDown);

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [showModal, goPrev, goNext]);

    if (!images.length) return null;

    const visibleThumbnails = images.slice(0, 4);

    return (
        <>
            <div className="flex min-w-0 flex-col-reverse items-start gap-4 lg:flex-row lg:gap-6">
                <div className="w-full min-w-0 lg:w-auto">
                    <div className="flex w-full min-w-0 gap-3 pb-2 lg:flex-col lg:pb-0">
                        {visibleThumbnails.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedIndex(i)}
                                className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition sm:h-24 sm:w-24 ${selectedIndex === i
                                    ? "border-black ring-2 ring-black/10"
                                    : "border-border-muted hover:border-black/30"
                                    }`}
                            >
                                <Image
                                    src={img.url}
                                    alt={`Product thumbnail ${i + 1}`}
                                    fill
                                    sizes="96px"
                                    className="object-contain"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div
                    onClick={() => setShowModal(true)}
                    className="group relative w-full cursor-zoom-in overflow-hidden rounded-3xl bg-[#f7f7f8]"
                >
                    <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                        <ZoomIn className="h-3.5 w-3.5" />
                        Click to expand
                    </div>

                    <div className="relative aspect-square w-full">
                        <Image
                            src={images[selectedIndex]?.url}
                            alt="Product"
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-contain transition duration-300 group-hover:scale-[1.02]"
                        />
                    </div>
                </div>
            </div>

            {showModal && createPortal(
                <div className="fixed inset-0 z-9999 overflow-hidden overscroll-contain">
                    {/* Backdrop */}
                    <button
                        type="button"
                        aria-label="Close gallery"
                        onClick={() => setShowModal(false)}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal shell */}
                    <div className="relative z-10 flex h-full items-center justify-center p-4 sm:p-6">
                        <div
                            role="dialog"
                            aria-modal="true"
                            aria-label="Product image gallery"
                            className="relative flex h-[78vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border-muted bg-bg-page text-text-primary shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b border-brand-primary/20 px-4 py-3 sm:px-5">
                                <div>
                                    <p className="text-sm font-medium">
                                        Product gallery
                                    </p>
                                    <p className="text-xs text-text-secondary">
                                        {selectedIndex + 1} / {images.length}
                                    </p>
                                </div>

                                <button
                                    ref={closeButtonRef}
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-primary/20 bg-bg-surface text-text-primary transition hover:bg-bg-dark hover:text-text-on-dark focus:outline-none focus:ring-2 focus:ring-white/30"
                                    aria-label="Close gallery"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Image area */}
                            <div className="relative flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4">
                                <div className="relative h-full w-full overflow-hidden rounded-2xl border border-brand-primary/20 bg-bg-surface">
                                    <div className="relative h-full w-full">
                                        <Image
                                            src={images[selectedIndex]?.url}
                                            alt={`Product image ${selectedIndex + 1}`}
                                            fill
                                            sizes="100vw"
                                            className="object-contain"
                                            priority
                                        />
                                    </div>

                                    {images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={goPrev}
                                                className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-primary/20 bg-black/80 text-text-on-dark shadow-lg backdrop-blur transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/30 sm:left-4"
                                                aria-label="Previous image"
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={goNext}
                                                className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-brand-primary/20 bg-black/80 text-text-on-dark shadow-lg backdrop-blur transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/30 sm:right-4"
                                                aria-label="Next image"
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bottom thumbnails */}
                            {images.length > 1 && (
                                <div className="border-t border-brand-primary/20 bg-bg-surface px-4 py-3 sm:px-5">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="hidden text-xs text-text-secondary sm:block">
                                            Use arrow keys to browse
                                        </p>

                                        <div className="flex w-full gap-2 overflow-x-auto pb-1 sm:w-auto">
                                            {images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => setSelectedIndex(i)}
                                                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border transition sm:h-16 sm:w-16 ${selectedIndex === i
                                                            ? "border-bg-dark ring-2 ring-bg-dark/20"
                                                            : "border-brand-primary/20 opacity-70 hover:opacity-100"
                                                        }`}
                                                    aria-label={`View image ${i + 1}`}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt={`Thumbnail ${i + 1}`}
                                                        fill
                                                        sizes="64px"
                                                        className="object-contain bg-white/5"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
