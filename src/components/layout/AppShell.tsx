"use client";

import TopBanner from "@/components/layout/TopBanner";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import LoginModal from "../auth/LoginModal";
import { useUI } from "@/context/UIContext";
import { useState } from "react";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoginOpen, closeLogin } = useUI();

  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <TopBanner />

      <Navbar
        onCartOpen={() => setCartOpen(true)}
      />

      {isLoginOpen && (
        <LoginModal onClose={closeLogin} />
      )}

      {children}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  );
}
