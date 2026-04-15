"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, LayoutGrid, MapPin, Package } from "lucide-react";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    {
      label: "Account",
      href: "/account",
      icon: LayoutGrid,
      description: "Profile and email",
    },
    {
      label: "Addresses",
      href: "/account/addresses",
      icon: MapPin,
      description: "Saved delivery addresses",
    },
    {
      label: "Orders",
      href: "/account/orders",
      icon: Package,
      description: "Track and review orders",
    },
  ];

  return (
    <div className="px-4 pt-24 pb-16 mx-auto max-w-7xl sm:px-6 sm:pb-20 sm:pt-36 lg:px-8">
      {/* MOBILE HEADER */}
      <div className="px-3 md:hidden">
        <button
          onClick={() => router.push("/account/orders")}
          className="inline-flex items-center gap-2 p-2 mb-5 text-sm font-medium transition border rounded-lg bg-neutral-50/40 border-border-muted/20 text-neutral-500 hover:text-neutral-900"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="mb-6">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-neutral-400">
            Dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            My Account
          </h1>
          <p className="max-w-xl mt-2 text-sm text-neutral-500">
            Manage your profile, saved addresses, and order history from one
            place.
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${active
                    ? "border-border-muted/20 bg-bg-dark text-white"
                    : "border-neutral-200 bg-neutral-50/40 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-1 md:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block">
          <div className="sticky top-28 rounded-[28px] border border-border-muted/20 bg-bg-surface p-5">
            <div className="pb-5 border-b border-neutral-200">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
                Account
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
                My Account
              </h1>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Manage your profile details, addresses, and recent orders.
              </p>
            </div>

            <nav className="mt-5 space-y-2" aria-label="Account navigation">
              {links.map((link) => {
                const active = pathname === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`group flex items-start gap-3 rounded-2xl px-4 py-3 transition ${active
                        ? "bg-bg-dark text-white"
                        : "text-neutral-700 hover:bg-neutral-50"
                      }`}
                  >
                    <span
                      className={`mt-0.5 rounded-xl p-2 transition ${active
                          ? "bg-white/10 text-white"
                          : "bg-neutral-100 text-neutral-500 group-hover:bg-white"
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>

                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {link.label}
                      </span>
                      <span
                        className={`mt-1 block text-xs leading-5 ${active ? "text-white/70" : "text-neutral-500"
                          }`}
                      >
                        {link.description}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* CONTENT */}
        <main className="min-w-0">
          <div className="">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}