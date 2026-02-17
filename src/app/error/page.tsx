"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function ErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-xl w-full bg-card border border-border rounded-3xl p-10 text-center shadow-sm">

        <div className="flex justify-center mb-6">
          <XCircle className="w-14 h-14 text-red-600" />
        </div>

        <h1 className="text-3xl font-playfair font-semibold">
          Something Went Wrong
        </h1>

        <p className="mt-4 text-text-muted">
          We couldn’t process your request at the moment.
          Please try again later.
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
