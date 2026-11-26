"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";

/* ================= TYPES ================= */

interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  image: string;
  weightLabel: string;
  quantity: number;
  priceAtAdd: number;
}

interface BackendCartItem {
  product: {
    _id: string;
    name: string;
    slug: string;
    images?: { url: string }[];
  };
  variant: {
    _id: string;
    weight: {
      value: number;
      unit: string;
    };
  };
  quantity: number;
  priceAtAdd: number;
}

/* Result of adding several items at once ("Buy again"). */
export interface AddManyResult {
  added: number;
  failed: { name: string; reason: string }[];
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  addManyToCart: (
    items: { productId: string; variantId: string; quantity: number; name: string }[]
  ) => Promise<AddManyResult>;
  removeFromCart: (
    productId: string,
    variantId: string
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

/* ================= GUEST CART =================
   Visitors can add to cart without logging in. The cart is kept in this
   browser and moved into their account as soon as they log in, which they
   only need to do at checkout. */

const GUEST_CART_KEY = "lv_guest_cart";

const readGuestCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeGuestCart = (items: CartItem[]) => {
  try {
    if (items.length) localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    else localStorage.removeItem(GUEST_CART_KEY);
  } catch {
    // storage unavailable (private mode): the cart still works for this visit
  }
};

/* ================= PROVIDER ================= */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const mergedForToken = useRef<string | null>(null);

  const setGuestCart = (items: CartItem[]) => {
    writeGuestCart(items);
    setCart(items);
  };

  /* ================= LOAD USER CART ================= */

  const loadUserCart = useCallback(async () => {
    if (!token) return;

    try {
      const res = await api.get("/customer/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const formatted = (res.data as BackendCartItem[]).map(
        (item) => ({
          productId: item.product._id,
          variantId: item.variant._id,
          name: item.product.name,
          slug: item.product.slug,
          image: item.product.images?.[0]?.url || "",
          weightLabel: `${item.variant.weight.value}${item.variant.weight.unit}`,
          quantity: item.quantity,
          priceAtAdd: item.priceAtAdd,
        })
      );

      setCart(formatted);
    } catch (error) {
      console.error("Failed to load cart", error);
    }
  }, [token]);

  /* ================= AUTO SYNC ON LOGIN CHANGE ================= */

  useEffect(() => {
    const syncCart = async () => {
      if (!isLoggedIn || !token) {
        mergedForToken.current = null;
        setCart(readGuestCart());
        return;
      }

      /* Move anything added before login into the account cart (once per login). */
      if (mergedForToken.current !== token) {
        mergedForToken.current = token;
        const guestItems = readGuestCart();
        writeGuestCart([]);

        const failed: string[] = [];
        for (const item of guestItems) {
          try {
            await api.post(
              "/customer/cart",
              {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch {
            failed.push(`${item.name} (${item.weightLabel})`);
          }
        }

        if (failed.length) {
          toast.error(
            `Some items couldn't be moved to your cart, possibly because they're out of stock: ${failed.join(", ")}`
          );
        }
      }

      try {
        const res = await api.get("/customer/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const formatted = (res.data as BackendCartItem[]).map(
          (item) => ({
            productId: item.product._id,
            variantId: item.variant._id,
            name: item.product.name,
            slug: item.product.slug,
            image: item.product.images?.[0]?.url || "",
            weightLabel: `${item.variant.weight.value}${item.variant.weight.unit}`,
            quantity: item.quantity,
            priceAtAdd: item.priceAtAdd,
          })
        );

        setCart(formatted);
      } catch (error) {
        console.error("Failed to sync cart", error);
      }
    };

    syncCart();
  }, [isLoggedIn, token]);

  /* ================= REFRESH ================= */

  const refreshCart = useCallback(async () => {
    if (isLoggedIn && token) {
      await loadUserCart();
    }
  }, [isLoggedIn, token, loadUserCart]);

  /* ================= ADD ================= */

  const addToCart = async (item: CartItem) => {
    if (!isLoggedIn || !token) {
      const current = readGuestCart();
      const existing = current.find(
        (c) => c.productId === item.productId && c.variantId === item.variantId
      );
      const next = existing
        ? current.map((c) =>
            c === existing ? { ...c, quantity: c.quantity + item.quantity } : c
          )
        : [...current, item];
      setGuestCart(next);
      toast.success("Added to Cart");
      return;
    }

    try {
      await api.post(
        "/customer/cart",
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await loadUserCart();
      toast.success("Added to Cart");
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      toast.error(
        err.response?.data?.message || "Failed to add to cart"
      );
    }
  };

  /* ================= ADD SEVERAL (Buy again) =================
     Adds each item through the server, which checks it's still on sale and
     in stock, then reloads the cart once. No toast per item: the caller
     shows one summary. Logged-in customers only (orders need an account). */
  const addManyToCart = async (
    items: { productId: string; variantId: string; quantity: number; name: string }[]
  ): Promise<AddManyResult> => {
    const result: AddManyResult = { added: 0, failed: [] };
    if (!isLoggedIn || !token) {
      result.failed = items.map((i) => ({ name: i.name, reason: "Please log in" }));
      return result;
    }

    for (const item of items) {
      try {
        await api.post(
          "/customer/cart",
          { productId: item.productId, variantId: item.variantId, quantity: item.quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        result.added += 1;
      } catch (error) {
        const err = error as AxiosError<{ message?: string }>;
        result.failed.push({
          name: item.name,
          reason: err.response?.data?.message || "Not available",
        });
      }
    }

    if (result.added) await loadUserCart();
    return result;
  };

  /* ================= UPDATE ================= */

  const updateQuantity = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variantId);
      return;
    }

    if (!isLoggedIn || !token) {
      setGuestCart(
        readGuestCart().map((c) =>
          c.productId === productId && c.variantId === variantId
            ? { ...c, quantity }
            : c
        )
      );
      return;
    }

    try {
      await api.put(
        `/customer/cart/${productId}/${variantId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadUserCart();
    } catch (error) {
      console.error("Failed to update quantity", error);
    }
  };

  /* ================= REMOVE ================= */

  const removeFromCart = async (
    productId: string,
    variantId: string
  ) => {
    if (!isLoggedIn || !token) {
      setGuestCart(
        readGuestCart().filter(
          (c) => !(c.productId === productId && c.variantId === variantId)
        )
      );
      return;
    }

    try {
      await api.delete(
        `/customer/cart/${productId}/${variantId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await loadUserCart();
    } catch (error) {
      console.error("Failed to remove item", error);
    }
  };

  /* ================= CLEAR ================= */

  const clearCart = async () => {
    if (!isLoggedIn || !token) {
      setGuestCart([]);
      return;
    }

    try {
      await api.delete("/customer/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCart([]);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  /* ================= TOTALS ================= */

  const totalItems = cart.length;

  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + item.quantity * item.priceAtAdd,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addManyToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshCart,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/* ================= HOOK ================= */

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be inside CartProvider");
  return context;
};
