"use client";

import Link from "next/link";
import { MailX } from "lucide-react";

export default function UnsubscribedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-xl w-full bg-card border border-border rounded-3xl p-10 text-center shadow-sm">

        <div className="flex justify-center mb-6">
          <MailX className="w-14 h-14 text-red-500" />
        </div>

        <h1 className="text-3xl font-playfair font-semibold">
          You’ve Been Unsubscribed
        </h1>

        <p className="mt-4 text-text-muted">
          You will no longer receive marketing emails from Ledo Valley.
          If this was a mistake, you can subscribe again anytime.
        </p>

        <Link
          href="/"
          className="inline-block mt-8 px-8 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
