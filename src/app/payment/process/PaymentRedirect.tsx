"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { PAYU_URL } from "@/lib/constants";

export default function PaymentRedirect() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  const submittedRef = useRef(false);

  useEffect(() => {
    if (!dataParam) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    try {
      const data = JSON.parse(decodeURIComponent(dataParam));

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYU_URL; // ✅ Live/Test dynamic URL

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      console.error("Failed to parse PayU data", e);
    }
  }, [dataParam]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">
        Redirecting to secure payment...
      </p>
    </div>
  );
}
