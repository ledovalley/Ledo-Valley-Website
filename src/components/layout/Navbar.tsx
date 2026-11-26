"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import Image from "next/image";
import LedoLogo from "@/assets/logo/LedoLogo.svg";

/* Same tea types as the home page's "Choose Your Tea Types". */
const TEA_TYPES = ["Green Tea", "Black Tea", "Organic Tea", "Speciality Tea"];

interface NavbarProps {
  onCartOpen: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const [isSticky, setIsSticky] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState("");
  const router = useRouter();

  const { isLoggedIn, customer, logout } = useAuth();
  const { totalItems } = useCart();
  const { openLogin } = useUI();

  /* ================= STICKY ================= */

  useEffect(() => {
    const onScroll = () => setIsSticky(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ================= CLOSE DROPDOWNS ================= */

  useEffect(() => {
    const close = () => {
      setProfileOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    router.push("/");
  };

  return (
    <nav
      className={`z-50 transition-all duration-300 ${isSticky
          ? "fixed top-4 left-0 w-full"
          : "absolute top-12 left-0 w-full"
        }`}
    >
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 sm:px-6">
        <div className="relative h-16 rounded-full px-6 sm:px-8 backdrop-blur-md bg-white/70 shadow-sm flex items-center justify-between">

          {/* LEFT (Desktop Links) */}
          <div className="hidden md:flex gap-4 text-sm font-medium">
            <Link href="/shop" className="hover:font-semibold">Shop</Link>
            <Link href="/about" className="hover:font-semibold">About Us</Link>
            <Link href="/contact" className="hover:font-semibold">Contact</Link>
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={(e) => {
              e.stopPropagation();
              setMobileOpen((prev) => !prev);
            }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* CENTER LOGO */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image
              src={LedoLogo}
              alt="Ledo Valley Logo"
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* RIGHT */}
          <div className="flex gap-2 items-center">

            {/* ACCOUNT */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (!isLoggedIn) {
                  openLogin();
                } else {
                  setProfileOpen((prev) => !prev);
                }
              }}
              aria-label={isLoggedIn ? "My account" : "Log in"}
              className="p-2 rounded-full cursor-pointer hover:bg-black/5 transition"
            >
              <User size={18} />
            </button>

            {/* CART */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCartOpen();
              }}
              aria-label={totalItems > 0 ? `Cart, ${totalItems} item${totalItems === 1 ? "" : "s"}` : "Cart"}
              className="relative p-2 cursor-pointer rounded-full hover:bg-black/5 transition"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-brand-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

          {/* PROFILE DROPDOWN */}
          {profileOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-20 w-48 rounded-xl bg-white/90 backdrop-blur-md shadow-sm"
            >
              <div className="px-4 py-3 text-sm font-medium border-b border-border-muted/30">
                {customer?.phone}
              </div>

              <Link
                href="/account"
                className="block px-4 py-2 text-sm hover:bg-bg-dark/20"
              >
                Profile
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-bg-dark/20 hover:rounded-b-xl"
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* ================= MOBILE MENU ================= */}
        {mobileOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="md:hidden mt-3 max-h-[75vh] overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-md p-4"
          >
            {/* Search the shop */}
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = mobileSearch.trim();
                setMobileOpen(false);
                router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
              }}
              className="relative"
            >
              <label htmlFor="menu-search" className="sr-only">Search teas</label>
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
              <input
                id="menu-search"
                type="search"
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                placeholder="Search teas"
                className="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 outline-none focus:border-bg-dark"
              />
            </form>

            {/* Tea types */}
            <div className="mt-4">
              <Link
                href="/shop"
                className="flex items-center justify-between py-3 text-base font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Shop all teas <span aria-hidden="true">→</span>
              </Link>
              <div className="grid grid-cols-2 gap-2">
                {TEA_TYPES.map((t) => (
                  <Link
                    key={t}
                    href={`/shop?teaType=${encodeURIComponent(t)}`}
                    className="rounded-xl border border-black/10 bg-white/70 px-3 py-2.5 text-sm font-medium text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-3 divide-y divide-black/5 border-t border-black/5">
              {isLoggedIn ? (
                <>
                  <Link href="/account/orders" className="block py-3 text-base font-medium" onClick={() => setMobileOpen(false)}>
                    My Orders
                  </Link>
                  <Link href="/account" className="block py-3 text-base font-medium" onClick={() => setMobileOpen(false)}>
                    My Account
                  </Link>
                </>
              ) : (
                <button
                  type="button"
                  className="block w-full py-3 text-left text-base font-medium"
                  onClick={() => {
                    setMobileOpen(false);
                    openLogin();
                  }}
                >
                  Login / Sign up
                </button>
              )}
              {[
                ["/about", "About Us"],
                ["/contact", "Contact"],
                ["/distributor", "Become a Distributor"],
              ].map(([href, label]) => (
                <Link key={href} href={href} className="block py-3 text-base font-medium" onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}