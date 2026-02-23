"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { label: "Account", href: "/account" },
    { label: "Addresses", href: "/account/addresses" },
    { label: "Orders", href: "/account/orders" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-32 sm:pt-40">
      {/* MOBILE NAV */}
      <div className="md:hidden mb-8">
        {/* ================= BACK BUTTON ================= */}
        <button
          onClick={() => router.push("/account/orders")}
          className="text-sm text-gray-500 cursor-pointer hover:text-black mb-6 flex items-center gap-2"
        >
          ← Back to Orders
        </button>
        <h2 className="text-3xl font-semibold mb-4 font-playfair">
          My Account
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`shrink-0 px-4 py-2 rounded-full text-sm transition ${active
                  ? "bg-bg-dark text-white"
                  : "bg-gray-100"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-10">

        {/* DESKTOP SIDEBAR */}
        <div className="hidden md:block space-y-3">
          <h2 className="text-3xl font-semibold mb-4 font-playfair">
            My Account
          </h2>

          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-full transition ${active
                  ? "bg-bg-dark text-white"
                  : "hover:bg-bg-dark/20"
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="md:col-span-3 min-w-0">
          {children}
        </div>
      </div>
    </div>
  );
}