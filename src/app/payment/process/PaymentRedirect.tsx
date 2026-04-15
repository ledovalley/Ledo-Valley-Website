"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PAYU_URL } from "@/lib/constants";

export default function PaymentRedirect() {
  const searchParams = useSearchParams();
  const dataParam = searchParams.get("data");

  useEffect(() => {
    if (!dataParam) return;

    const data = JSON.parse(decodeURIComponent(dataParam));

    const form = document.createElement("form");
    form.method = "POST";
    form.action = PAYU_URL;

    Object.entries(data).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  }, [dataParam]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-medium">
        Redirecting to secure payment...
      </p>
    </div>
  );
}
