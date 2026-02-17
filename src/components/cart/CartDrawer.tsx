"use client";

import { X, Trash2, Minus, Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import clsx from "clsx";

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

  if (!open) return null;

  /* ================= CHECKOUT ================= */

  const handleCheckout = () => {
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
          "fixed right-0 top-0 h-full w-96 z-50",
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
            className="p-2 rounded-full hover:bg-black/5 transition"
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
                          className="text-gray-400 hover:text-red-500 transition disabled:opacity-40"
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
                            className="px-3 py-2 hover:bg-black/5 transition disabled:opacity-40"
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
                            className="px-3 py-2 hover:bg-black/5 transition disabled:opacity-40"
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
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= FOOTER ================= */}

            <div className="border-t px-6 py-6 space-y-4">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-brand-primary">
                  ₹{totalAmount.toFixed(0)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 cursor-pointer rounded-full bg-bg-dark text-white font-medium hover:bg-bg-dark/90 transition"
              >
                {isLoggedIn
                  ? "Proceed to Checkout"
                  : "Login to Checkout"}
              </button>

              <button
                onClick={handleClearCart}
                disabled={clearing}
                className="w-full cursor-pointer text-sm text-text-secondary underline hover:text-red-500 transition disabled:opacity-50"
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
