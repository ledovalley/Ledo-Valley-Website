import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 pt-36 pb-20 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-text-secondary">404</p>
      <h1 className="mt-3 text-4xl font-playfair font-semibold text-text-primary">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-text-secondary">
        It may have moved, or the link may be wrong. Our teas are just a click away.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="rounded-full bg-bg-dark px-8 py-3 text-sm font-medium text-text-on-dark transition hover:bg-bg-dark/90"
        >
          Shop teas
        </Link>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-8 py-3 text-sm font-medium text-text-primary transition hover:bg-black/5"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
