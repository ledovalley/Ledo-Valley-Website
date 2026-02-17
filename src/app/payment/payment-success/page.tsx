"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

interface OrderSummary {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
}

/* ================= COMPONENT ================= */

export default function PaymentSuccessPage() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await api.get<OrderSummary[]>("/customer/orders");

        if (res.data.length > 0) {
          setOrder(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load order", err);
      }
    };

    fetchLatestOrder();
  }, []);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading order details...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Payment Successful 🎉
      </h1>

      <p className="mb-2">
        Order Number: <strong>{order.orderNumber}</strong>
      </p>

      <p className="mb-6">
        Amount Paid: ₹{order.grandTotal}
      </p>

      <button
        onClick={() => router.push("/account/orders")}
        className="px-6 py-3 bg-bg-dark cursor-pointer hover:bg-bg-dark/90 text-white rounded-full"
      >
        View My Orders
      </button>
    </div>
  );
}
