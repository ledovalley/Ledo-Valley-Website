import { Suspense } from "react";
import VerifyEmailClient from "./VerifyEmailClient";

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          Verifying...
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
