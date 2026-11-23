"use client";

import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

    onClose();
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
                    className="flex gap-4 items-center"
                  >
                    {/* IMAGE */}
                    <Link
                      href={`/shop/${item.slug}`}
                      onClick={onClose}
                      className="relative w-20 h-20 rounded-xl overflow-hidden bg-bg-surface"
                    >
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-2"
                        />
                      )}
                    </Link>

                    {/* DETAILS */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-1">
                          <Link
                            href={`/shop/${item.slug}`}
                            onClick={onClose}
                            className="font-medium text-text-primary hover:underline"
                          >
                            {item.name}
                          </Link>

                          <p className="text-text-secondary/60 font-medium">
                            {" | "}
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
                          className="text-gray-400 cursor-pointer hover:text-red-500 transition disabled:opacity-40"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* QTY + PRICE */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border rounded-full overflow-hidden">
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
                            className="px-3 py-2 cursor-pointer hover:bg-black/5 transition disabled:opacity-40"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="px-3 text-sm font-medium">
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
                            className="px-3 py-2 cursor-pointer hover:bg-black/5 transition disabled:opacity-40"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <p className="font-semibold text-brand-primary">
                          ₹
                          {(
                            item.quantity *
                            item.priceAtAdd
                          ).toFixed(0)}
                        </p>
                      </div>

                      {/* Tiered incentive shortcut if quantity is 1 */}
                      {item.quantity === 1 && (
                        <div className="mt-2.5">
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
                            className="w-full text-xs font-medium text-brand-primary cursor-pointer bg-brand-primary/10 hover:bg-brand-primary/15 px-3 py-1.5 rounded-xl border border-brand-primary/20 flex items-center justify-between transition disabled:opacity-50"
                          >
                            <span>Add 1 more to make it a 2-Pack</span>
                            <span className="font-bold">Save more →</span>
                          </button>
                        </div>
                      )}
                    </div>
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
                className="w-full py-3.5 cursor-pointer rounded-full bg-bg-dark text-white font-medium hover:bg-bg-dark/90 active:scale-98 transition shadow-sm text-sm"
              >
                {isLoggedIn
                  ? "Proceed to Checkout"
                  : "Login to Checkout"}
              </button>

              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="w-full cursor-pointer text-xs text-text-secondary hover:text-red-500 transition disabled:opacity-50 text-center block pt-1"
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
