import { Suspense } from "react";
import PaymentRedirect from "./PaymentRedirect";

export default function PaymentProcessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        Processing payment...
      </div>
    }>
      <PaymentRedirect />
    </Suspense>
  );
}
