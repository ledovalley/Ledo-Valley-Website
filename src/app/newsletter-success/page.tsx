"use client";

import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function NewsletterSuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-card border border-border rounded-3xl p-10 text-center shadow-sm bg-bg-surface/60">
        
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-14 h-14 text-green-600" />
        </div>

        <h1 className="text-3xl font-playfair font-semibold">
          Subscription Confirmed 🎉
        </h1>

        <p className="mt-4 text-text-muted">
          Thank you for verifying your email. You are now subscribed to
          Ledo Valley’s newsletter and will receive updates about our
          latest offers and product releases.
        </p>

        <Link
          href="/"
          className="inline-block bg-bg-dark hover:bg-bg-dark/90 cursor-pointer mt-8 px-8 py-3 rounded-full bg-primary text-white text-sm font-medium hover:opacity-90 transition"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
