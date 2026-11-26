"use client";

import Link from "next/link";

/*
 * Checkout now goes straight to PayU, so this page is only reached from an
 * old link or the browser's Back button. It never re-sends a payment.
 */
export default function PaymentRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-4">
        <p className="text-lg font-medium">This payment page has expired.</p>
        <p className="text-sm text-gray-600">
          If you&apos;ve already paid, your order will update automatically. Otherwise you can pay for it from My Orders.
        </p>
        <Link href="/account/orders" className="inline-block px-6 py-2 text-white rounded-full bg-bg-dark">
          Go to My Orders
        </Link>
      </div>
    </div>
  );
}
