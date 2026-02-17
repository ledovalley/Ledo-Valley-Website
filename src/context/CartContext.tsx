"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
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

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
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

/* ================= PROVIDER ================= */

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, token } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

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
        setCart([]);
        return;
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
      toast.error("Please login to add items to cart");
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

  /* ================= UPDATE ================= */

  const updateQuantity = async (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    if (!isLoggedIn || !token) return;

    if (quantity <= 0) {
      await removeFromCart(productId, variantId);
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
    if (!isLoggedIn || !token) return;

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
    if (!isLoggedIn || !token) return;

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

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

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
