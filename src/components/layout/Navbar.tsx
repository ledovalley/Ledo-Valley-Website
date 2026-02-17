"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, User, LogOut } from "lucide-react";
import Image from "next/image";
import LedoLogo from "@/assets/logo/LedoLogo.svg";

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({
  onCartOpen,
}: NavbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { isLoggedIn, customer, logout } = useAuth();
  const { totalItems } = useCart();
  const { openLogin } = useUI();

  /* ================= STICKY ================= */

  useEffect(() => {
    const onScroll = () =>
      setIsSticky(window.scrollY > 80);

    window.addEventListener("scroll", onScroll);
    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= PROFILE CLOSE ================= */

  useEffect(() => {
    if (!profileOpen) return;

    const close = () => setProfileOpen(false);
    window.addEventListener("click", close);

    return () =>
      window.removeEventListener("click", close);
  }, [profileOpen]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
  };

  return (
    <nav
      className={`z-50 transition-all duration-300 ${
        isSticky
          ? "fixed top-6 left-0 w-full"
          : "absolute top-18 left-0 w-full"
      }`}
    >
      <div className="max-w-4xl px-6 mx-auto">
        <div className="relative h-16 rounded-full px-8 backdrop-blur-md bg-white/70 shadow-sm">

          {/* LEFT */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex gap-6 text-sm font-medium">
            <Link href="/shop">Shop</Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
          </div>

          {/* CENTER LOGO */}
          <Link
            href="/"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <Image
              src={LedoLogo}
              alt="Ledo Valley Logo"
              className="w-full"
            />
          </Link>

          {/* RIGHT */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-2 items-center">

            {/* ACCOUNT */}
            <button
              onClick={(e) => {
                e.stopPropagation();

                if (!isLoggedIn) {
                  setProfileOpen(false);
                  openLogin(); // ✅ Clean UI context
                } else {
                  setProfileOpen((prev) => !prev);
                }
              }}
              className="p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
            >
              <User size={18} />
            </button>

            {/* CART */}
            <button
              onClick={onCartOpen}
              className="relative p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
            >
              <ShoppingBag size={18} />

              <span
                className={`absolute top-0 right-0 
                  bg-brand-primary text-white text-[10px] 
                  px-1.5 py-0.5 rounded-full
                  transition-opacity duration-200
                  ${
                    totalItems > 0
                      ? "opacity-100"
                      : "opacity-0"
                  }`}
              >
                {totalItems}
              </span>
            </button>
          </div>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div className="absolute right-6 top-20 w-48 rounded-xl bg-white backdrop-blur-md shadow-lg">
              {isLoggedIn ? (
                <>
                  <div className="px-4 py-3 text-sm font-medium">
                    {customer?.phone}
                  </div>

                  <Link
                    href="/account"
                    className="block cursor-pointer px-4 py-2 text-sm hover:bg-black/5"
                  >
                    Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 text-sm hover:bg-warning/40 rounded-br-xl rounded-bl-xl"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    openLogin(); // ✅ Clean
                  }}
                  className="block px-4 py-3 text-sm hover:bg-black/5 w-full text-left"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
