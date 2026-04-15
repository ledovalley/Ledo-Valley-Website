"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  AlertCircle, 
  ArrowLeft, 
  RotateCcw, 
  ShoppingBag,
  CreditCard
} from "lucide-react";
import { toast } from "sonner";

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
      form.action = "https://test.payu.in/_payment";

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("Retry failed", err);
      toast.error(err.response?.data?.message || "Failed to initiate retry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bg-dark"></div>
        <p className="text-gray-500 font-medium">Checking order status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="text-red-500 w-10 h-10" />
      </div>

      <h1 className="text-4xl font-playfair font-bold text-gray-900 mb-4">
        Payment Failed
      </h1>

      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {urlError || order?.payment?.failureReason || 
         "We couldn't process your payment. This could be due to incorrect details, insufficient funds, or a temporary issue with your bank."}
      </p>

      {order && (
        <div className="w-full bg-gray-50 rounded-3xl p-8 mb-10 text-left border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-gray-500 text-sm">Order Number</span>
            <span className="font-semibold text-gray-900">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center pt-4">
            <span className="text-gray-500 text-sm">Total Amount</span>
            <span className="text-xl font-bold font-playfair text-gray-900">₹{order.grandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          onClick={handleRetry}
          disabled={loading || !order}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-bg-dark text-white rounded-full font-medium transition-all hover:bg-bg-dark/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
        >
          {loading ? (
             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <RotateCcw size={18} />
              Retry Payment
            </>
          )}
        </button>

        <button
          onClick={() => router.push("/checkout")}
          className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-bg-dark border border-gray-200 rounded-full font-medium transition-all hover:bg-gray-50 active:scale-95"
        >
          <ArrowLeft size={18} />
          Back to Checkout
        </button>
      </div>

      <div className="mt-8">
        <button
          onClick={() => router.push("/")}
          className="text-gray-500 hover:text-bg-dark text-sm font-medium flex items-center gap-1 mx-auto transition-colors"
        >
          <ShoppingBag size={16} />
          Continue Shopping
        </button>
      </div>
      
      {!order && !fetching && (
        <p className="mt-12 text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bg-dark"></div>
      </div>
    }>
      <PaymentFailedContent />
    </Suspense>
  );
}
