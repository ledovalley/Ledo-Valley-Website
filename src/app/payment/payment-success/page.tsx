"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { CheckCircle2, ShoppingBag, Package, MapPin } from "lucide-react";

/* ================= TYPES ================= */

interface OrderSummary {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  payment?: {
    method: string;
    status: string;
  };
  shippingAddress?: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
}

/* ================= CONTENT COMPONENT ================= */

function PaymentSuccessContent() {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        setFetching(true);
        const res = await api.get<OrderSummary[]>("/customer/orders");

        if (res.data.length > 0) {
          setOrder(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setFetching(false);
      }
    };

    fetchLatestOrder();
  }, []);

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-bg-dark"></div>
        <p className="font-medium text-gray-500">Retrieving your order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <p className="font-medium text-gray-500">Could not find your recent order.</p>
        <button
          onClick={() => router.push("/account/orders")}
          className="px-6 py-2 text-white rounded-full bg-bg-dark"
        >
          View My Orders
        </button>
      </div>
    );
  }

  const isCOD = order.payment?.method === "COD";

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl px-6 py-16 mx-auto text-center min-h-[80vh]">
      <h1 className="mt-12 mb-2 text-4xl font-bold text-gray-900 font-playfair">
        Order Confirmed!
      </h1>

      <p className="max-w-md mx-auto mb-10 text-gray-600">
        Thank you for your purchase. Your order has been successfully placed and is now being processed.
      </p>

      <div className="w-full text-left bg-bg-surface border shadow-sm border-black/5 rounded-3xl overflow-hidden mb-8">
        <div className="p-6 sm:p-8 bg-bg-surface/30">
          <h3 className="mb-4 text-lg font-semibold font-playfair flex items-center gap-2">
            <Package size={20} className="text-gray-500" />
            Order Summary
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Order Number</span>
              <span className="font-semibold text-gray-900">{order.orderNumber}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Date</span>
              <span className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="text-sm text-gray-500">Payment Method</span>
              <span className="font-medium text-gray-900">
                {isCOD ? "Cash on Delivery" : "Online Payment"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-base text-gray-700 font-medium">
                {isCOD ? "Amount to Pay at Delivery" : "Total Paid"}
              </span>
              <span className="text-2xl font-bold text-bg-dark">
                ₹{order.grandTotal.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {order.shippingAddress && (
          <div className="p-6 sm:p-8 border-t border-black/5 bg-bg-surface">
            <h3 className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin size={16} className="text-gray-400" />
              Delivering To
            </h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium text-gray-900 mb-1">{order.shippingAddress.name}</p>
              <p>
                {order.shippingAddress.addressLine1}
                {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
              </p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
              <p className="mt-2 text-gray-500">Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col w-full gap-4 sm:flex-row sm:w-auto">
        <button
          onClick={() => router.push("/account/orders")}
          className="flex items-center justify-center gap-2 px-8 py-4 font-medium text-white transition-all rounded-full shadow-lg bg-bg-dark hover:bg-bg-dark/90 active:scale-95 shadow-black/10"
        >
          View Order Status
        </button>

        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 px-8 py-4 font-medium transition-all bg-white border border-gray-200 rounded-full text-bg-dark hover:bg-gray-50 active:scale-95"
        >
          <ShoppingBag size={18} />
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-bg-dark"></div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
