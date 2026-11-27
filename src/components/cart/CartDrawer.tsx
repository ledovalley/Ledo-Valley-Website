"use client";

import { X, Trash2, Minus, Plus, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { trackViewCart, trackBeginCheckout } from "@/lib/gtm";
import FreeShippingBar from "./FreeShippingBar";
import CartDrawerUpsell from "./CartDrawerUpsell";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({
  open,
  onClose,
}: Props) {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalAmount,
    totalItems,
  } = useCart();

  const { isLoggedIn } = useAuth();
  const { openLogin } = useUI();
  const router = useRouter();

  const [clearing, setClearing] = useState(false);
  const [updatingKey, setUpdatingKey] =
    useState<string | null>(null);

  useEffect(() => {
    if (open && cart.length > 0) {
      trackViewCart(cart, totalAmount);
    }
  }, [open]);

  // Load the checkout page in the background as soon as the cart opens, so
  // "Proceed to Checkout" opens it without a wait.
  useEffect(() => {
    if (open && isLoggedIn && cart.length > 0) router.prefetch("/checkout");
  }, [open, isLoggedIn, cart.length, router]);

  // After "Proceed to Checkout": the button shows "Opening checkout…" and the
  // cart stays open until the checkout page is actually on screen.
  const pathname = usePathname();
  const [goingToCheckout, setGoingToCheckout] = useState(false);
  useEffect(() => {
    if (goingToCheckout && pathname?.startsWith("/checkout")) {
      setGoingToCheckout(false);
      onClose();
    }
  }, [pathname, goingToCheckout, onClose]);

  if (!open) return null;

  /* ================= CHECKOUT ================= */

  const handleCheckout = () => {
    if (cart.length > 0) {
      trackBeginCheckout(cart, totalAmount);
    }

    if (!isLoggedIn) {
      onClose();
      openLogin(); // ✅ Clean
      return;
    }

    if (pathname?.startsWith("/checkout")) {
      onClose();
      return;
    }
    setGoingToCheckout(true);
    router.push("/checkout");
  };

  /* ================= CLEAR CART ================= */

  const handleClearCart = async () => {
    try {
      setClearing(true);
      await clearCart();
    } finally {
      setClearing(false);
    }
  };

  /* ================= UPDATE QTY ================= */

  const handleUpdate = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    const key = `${productId}-${variantId}`;
    setUpdatingKey(key);

    try {
      await updateQuantity(productId, variantId, quantity);
    } finally {
      setUpdatingKey(null);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* DRAWER */}
      <aside
        className={clsx(
          "fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full z-50",
          "bg-bg-page shadow-2xl flex flex-col",
          "transform transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5 border-b">
          <h3 className="text-xl font-playfair font-semibold">
            Your Cart ({totalItems})
          </h3>

          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 rounded-full cursor-pointer hover:bg-black/5 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* ================= EMPTY STATE ================= */}

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <p className="text-text-secondary mb-5">
              Your cart is empty.
            </p>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-bg-dark text-white text-sm hover:bg-bg-dark/90 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ================= ITEMS ================= */}

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {cart.map((item) => {
                const key = `${item.productId}-${item.variantId}`;
                const isUpdating = updatingKey === key;

                return (
                  <div
                    key={key}
                    className="flex flex-col gap-2.5 pb-5 border-b border-black/5 last:border-b-0 last:pb-0"
                  >
                    <div className="flex gap-3.5 items-start">
                      {/* IMAGE */}
                      <Link
                        href={`/shop/${item.slug}`}
                        onClick={onClose}
                        className="relative w-20 h-20 rounded-xl overflow-hidden bg-white border border-black/15 shrink-0"
                      >
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        )}
                      </Link>

                      {/* DETAILS */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              href={`/shop/${item.slug}`}
                              onClick={onClose}
                              className="font-medium text-sm text-text-primary hover:underline line-clamp-1 block"
                            >
                              {item.name}
                            </Link>

                            <p className="text-xs text-text-secondary mt-0.5">
                              {item.weightLabel}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              removeFromCart(
                                item.productId,
                                item.variantId
                              )
                            }
                            disabled={isUpdating}
                            aria-label="Remove item"
                            className="text-gray-400 cursor-pointer hover:text-red-500 transition disabled:opacity-40 p-2.5 -m-2 sm:p-1 sm:-mr-1 sm:m-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* QTY + PRICE */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-black/15 rounded-full overflow-hidden bg-white h-10 sm:h-8">
                            <button
                              onClick={() =>
                                handleUpdate(
                                  item.productId,
                                  item.variantId,
                                  item.quantity - 1
                                )
                              }
                              disabled={
                                item.quantity <= 1 ||
                                isUpdating
                              }
                              aria-label="One less"
                              className="w-10 sm:w-auto sm:px-2.5 h-full flex items-center justify-center cursor-pointer hover:bg-black/5 transition disabled:opacity-30"
                            >
                              <Minus size={14} />
                            </button>

                            <span className="px-2 text-sm sm:text-xs font-semibold min-w-6 text-center" aria-live="polite">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                handleUpdate(
                                  item.productId,
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              disabled={isUpdating}
                              aria-label="One more"
                              className="w-10 sm:w-auto sm:px-2.5 h-full flex items-center justify-center cursor-pointer hover:bg-black/5 transition disabled:opacity-40"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <p className="font-bold text-base text-brand-primary">
                            ₹{(item.quantity * item.priceAtAdd).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Tiered incentive shortcut if quantity is 1 */}
                    {item.quantity === 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdate(
                            item.productId,
                            item.variantId,
                            2
                          )
                        }
                        disabled={isUpdating}
                        className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-brand-primary/8 hover:bg-brand-primary/12 border border-brand-primary/20 text-brand-primary flex items-center justify-between transition cursor-pointer disabled:opacity-50"
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                          <span>Make it a Pack of 2</span>
                        </span>
                        <span className="font-semibold text-2xs uppercase tracking-wider bg-brand-primary text-white px-2 py-0.5 rounded-md">
                          + Add 1
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ================= FOOTER ================= */}

            <div className="border-t px-6 py-5 space-y-3 bg-bg-surface/30">
              <FreeShippingBar itemsTotal={totalAmount} />

              <CartDrawerUpsell />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-medium text-text-secondary">Subtotal</span>
                <span className="text-xl font-bold text-brand-primary">
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={goingToCheckout}
                className="w-full py-3.5 cursor-pointer rounded-full bg-bg-dark text-white font-medium hover:bg-bg-dark/90 active:scale-98 transition shadow-sm text-sm inline-flex items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-80"
              >
                {goingToCheckout && <Loader2 className="h-4 w-4 animate-spin" />}
                {goingToCheckout
                  ? "Opening checkout…"
                  : isLoggedIn
                    ? "Proceed to Checkout"
                    : "Login to Checkout"}
              </button>

              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="w-full cursor-pointer text-xs text-text-secondary hover:text-red-500 transition disabled:opacity-50 text-center block py-2 sm:pt-1 sm:pb-0"
              >
                {clearing ? "Clearing..." : "Clear Cart"}
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
