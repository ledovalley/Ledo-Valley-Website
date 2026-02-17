"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        return;
      }

      try {
        await api.get(
          `/customer/profile/verify-email?token=${token}`
        );

        setStatus("success");

        setTimeout(() => {
          router.push("/account");
        }, 2500);
      } catch {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-6">

        {status === "loading" && (
          <>
            <h1 className="text-3xl font-playfair">
              Verifying your email...
            </h1>
            <p className="text-gray-500">
              Please wait while we confirm your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-3xl font-playfair text-green-600">
              Email Verified 🎉
            </h1>
            <p className="text-gray-500">
              Your email has been successfully verified.
            </p>
            <p className="text-sm text-gray-400">
              Redirecting to your account...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-playfair text-red-500">
              Verification Failed
            </h1>
            <p className="text-gray-500">
              The link may be invalid or expired.
            </p>
            <button
              onClick={() => router.push("/account")}
              className="px-6 py-3 bg-black text-white rounded-lg"
            >
              Go to Account
            </button>
          </>
        )}
      </div>
    </div>
  );
}
