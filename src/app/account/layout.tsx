"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { label: "Account", href: "/account" },
    { label: "Addresses", href: "/account/addresses" },
    { label: "Orders", href: "/account/orders" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-40">
      <div className="grid md:grid-cols-4 gap-10">
        
        {/* SIDEBAR */}
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold mb-4 text-text-primary font-playfair">
            My Account
          </h2>

          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-4 py-2 rounded-full transition ${
                  active
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
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
