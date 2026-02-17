import { Suspense } from "react";
import ShopClient from "./ShopClient";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading shop...
        </div>
      }
    >
      <ShopClient />
    </Suspense>
  );
}
