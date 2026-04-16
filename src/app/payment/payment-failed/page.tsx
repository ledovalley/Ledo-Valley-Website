"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { PAYU_URL } from "@/lib/constants";
import { toast } from "sonner";
import axios from "axios";

/* ================= TYPES ================= */

interface OrderSummary {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  payment?: {
    failureReason?: string;
  };
}

/* ================= CONTENT COMPONENT ================= */

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const urlError = searchParams.get("error");

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setFetching(true);

        // If we have an orderId from URL, fetch that specific one
        if (orderId) {
          const res = await api.get<OrderSummary>(`/customer/orders/${orderId}`);
          setOrder(res.data);
        } else {
          // Fallback: fetch latest failed order
          const res = await api.get<OrderSummary[]>("/customer/orders");
          const failedOrder = res.data.find(
            (o) => o.status === "PAYMENT_FAILED"
          );
          if (failedOrder) {
            setOrder(failedOrder);
          }
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setFetching(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleRetry = async () => {
    if (!order) return;

    try {
      setLoading(true);
      toast.info("Preparing to retry payment...");

      const res = await api.post(
        `/customer/orders/${order._id}/retry-payment`
      );

      const data = res.data.payu;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYU_URL; // ✅ Dynamic URL

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error("Retry failed", err);

      let message = "Failed to initiate retry. Please try again.";

      if (axios.isAxiosError(err)) {
        message = err.response?.data?.message || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-bg-dark"></div>
        <p className="font-medium text-gray-500">Checking order status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-50">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>

      <h1 className="mb-4 text-4xl font-bold text-gray-900 font-playfair">
        Payment Failed
      </h1>

      <p className="max-w-md mx-auto mb-8 text-gray-600">
        {urlError || order?.payment?.failureReason ||
          "We couldn't process your payment. This could be due to incorrect details, insufficient funds, or a temporary issue with your bank."}
      </p>

      {order && (
        <div className="w-full p-8 mb-10 text-left border border-gray-100 shadow-sm bg-gray-50 rounded-3xl">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="font-semibold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-xl font-bold text-gray-900 font-playfair">₹{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full gap-4 sm:flex-row sm:w-auto">
        <button
          onClick={handleRetry}
          disabled={loading || !order}
          className="flex items-center justify-center gap-2 px-8 py-4 font-medium text-white transition-all rounded-full shadow-lg bg-bg-dark hover:bg-bg-dark/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-black/10"
        >
          {loading ? (
            <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
          ) : (
            <>
              <RotateCcw size={18} />
              Retry Payment
            </>
          )}
        </button>

        <button
          onClick={() => router.push("/checkout")}
          className="flex items-center justify-center gap-2 px-8 py-4 font-medium transition-all bg-white border border-gray-200 rounded-full text-bg-dark hover:bg-gray-50 active:scale-95"
        >
          <ArrowLeft size={18} />
          Back to Checkout
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 mx-auto text-sm font-medium text-gray-500 transition-colors hover:text-bg-dark"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </button>
      </div>

      {!order && !fetching && (
        <p className="px-4 py-2 mt-12 text-sm border rounded-full text-amber-600 bg-amber-50 border-amber-100">
          Note: If you were charged, please check your email for confirmation or contact support.
        </p>
      )}
    </div>
  );
}

/* ================= MAIN PAGE ================= */

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-bg-dark"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
