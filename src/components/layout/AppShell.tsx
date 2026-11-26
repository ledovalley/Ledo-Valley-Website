"use client";

import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import LoginModal from "../auth/LoginModal";
import { useUI } from "@/context/UIContext";
import { useState } from "react";
import GoogleProvider from "../auth/GoogleProvider";

export default function AppShell({
  children,
  topBanners,
}: {
  children: React.ReactNode;
  topBanners?: unknown[];
}) {
  const { isLoginOpen, closeLogin } = useUI();

  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <TopBanner initialBanners={topBanners as Parameters<typeof TopBanner>[0]["initialBanners"]} />

      <Navbar
        onCartOpen={() => setCartOpen(true)}
      />

      {isLoginOpen && (
        <GoogleProvider>
          <LoginModal onClose={closeLogin} />
        </GoogleProvider>
      )}

      {children}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}
