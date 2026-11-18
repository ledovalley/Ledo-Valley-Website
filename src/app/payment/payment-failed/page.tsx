"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Clock,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { PAYU_URL } from "@/lib/constants";
import { toast } from "sonner";
import axios from "axios";
import { trackPurchaseFailed } from "@/lib/gtm";

/* ================= TYPES ================= */

interface OrderSummary {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  items?: unknown[];
  payment?: {
    status?: string;
    failureReason?: string;
  };
}

/* How long the page keeps checking a payment the bank is still confirming. */
const CHECK_EVERY_MS = 10_000;
const CHECK_FOR_MS = 5 * 60_000;

/* The backend leaves the order PENDING (not FAILED) while PayU/the bank is still confirming. */
const isConfirming = (o: OrderSummary | null) =>
  !!o && o.status === "PAYMENT_PENDING" && o.payment?.status === "PENDING";

const isPaid = (o: OrderSummary | null) =>
  !!o && (o.payment?.status === "SUCCESS" || ["PAYMENT_SUCCESS", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(o.status));

/* ================= CONTENT COMPONENT ================= */

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const urlError = searchParams.get("error");

  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [gaveUp, setGaveUp] = useState(false);
  const tracked = useRef(false);
  const router = useRouter();

  const goToSuccess = useCallback(() => {
    router.replace("/payment/payment-success");
  }, [router]);

  /* Ask the backend (which asks PayU) for the latest status. */
  const checkOrder = useCallback(async (id: string) => {
    try {
      const res = await api.post<OrderSummary>(`/customer/orders/${id}/check-payment`);
      return res.data;
    } catch {
      // Older backend without the check endpoint: just read the order.
      const res = await api.get<OrderSummary>(`/customer/orders/${id}`);
      return res.data;
    }
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setFetching(true);

        let found: OrderSummary | null = null;

        if (orderId) {
          found = await checkOrder(orderId);
        } else {
          // Fallback: latest order that hasn't been paid
          const res = await api.get<OrderSummary[]>("/customer/orders");
          found =
            res.data.find((o) => ["PAYMENT_FAILED", "PAYMENT_PENDING"].includes(o.status)) || null;
        }

        if (isPaid(found)) {
          goToSuccess();
          return;
        }

        setOrder(found);

        if (found && !isConfirming(found) && !tracked.current) {
          tracked.current = true;
          trackPurchaseFailed(found, urlError || undefined);
        }
      } catch (err) {
        console.error("Failed to load order", err);
      } finally {
        setFetching(false);
      }
    };

    fetchOrder();
  }, [orderId, urlError, checkOrder, goToSuccess]);

  /* Keep checking while the payment is being confirmed. */
  const confirming = isConfirming(order);

  useEffect(() => {
    if (!confirming || !order) return;

    const started = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - started > CHECK_FOR_MS) {
        clearInterval(timer);
        setGaveUp(true);
        return;
      }
      try {
        const latest = await checkOrder(order._id);
        if (isPaid(latest)) {
          clearInterval(timer);
          goToSuccess();
          return;
        }
        if (!isConfirming(latest)) {
          clearInterval(timer);
          setOrder(latest);
          if (!tracked.current) {
            tracked.current = true;
            trackPurchaseFailed(latest, latest.payment?.failureReason);
          }
        }
      } catch {
        // keep trying until the time limit
      }
    }, CHECK_EVERY_MS);

    return () => clearInterval(timer);
  }, [confirming, order, checkOrder, goToSuccess]);

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
    } catch (err) {
      console.error("Retry failed", err);

      let message = "Failed to initiate retry. Please try again.";

      if (axios.isAxiosError(err)) {
        // The backend refuses a retry if the earlier payment went through.
        if (err.response?.data?.paid) {
          toast.success(err.response.data.message);
          goToSuccess();
          return;
        }
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
        <p className="font-medium text-gray-500">Checking your payment...</p>
      </div>
    );
  }

  /* ---------- Still confirming: never offer a second payment here ---------- */
  if (confirming && order) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-amber-50">
          <Clock className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="mb-4 text-4xl font-bold text-gray-900 font-playfair">
          Confirming your payment
        </h1>

        <p className="max-w-md mx-auto mb-3 text-gray-600">
          Your bank is still confirming this payment. <strong>Please don&apos;t pay again.</strong>
        </p>
        <p className="max-w-md mx-auto mb-8 text-sm text-gray-500">
          {gaveUp
            ? "This is taking longer than usual. We'll email you as soon as it's confirmed, and you can check the status any time in My Orders. If the payment doesn't go through, any amount taken is returned by your bank."
            : "This page updates by itself. It usually takes under a few minutes."}
        </p>

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

        {!gaveUp && (
          <div className="flex items-center gap-2 mb-8 text-sm text-gray-500">
            <div className="w-4 h-4 border-b-2 rounded-full animate-spin border-bg-dark"></div>
            Checking with the payment provider…
          </div>
        )}

        <Link
          href={`/account/orders/${order._id}`}
          className="flex items-center justify-center gap-2 px-8 py-4 font-medium text-white transition-all rounded-full shadow-lg bg-bg-dark hover:bg-bg-dark/90"
        >
          View order status
        </Link>
      </div>
    );
  }

  /* ---------- Payment failed ---------- */
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
      <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-red-50">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>

      <h1 className="mb-4 text-4xl font-bold text-gray-900 font-playfair">
        Payment Failed
      </h1>

      <p className="max-w-md mx-auto mb-8 text-gray-600">
        {order?.payment?.failureReason || urlError ||
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
        {order?.status === "PAYMENT_FAILED" && (
          <button
            onClick={handleRetry}
            disabled={loading}
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
        )}

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

      <p className="px-4 py-2 mt-12 text-sm border rounded-full text-amber-700 bg-amber-50 border-amber-100">
        If money was taken from your account, it will either be confirmed automatically or returned by your bank.
      </p>
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
