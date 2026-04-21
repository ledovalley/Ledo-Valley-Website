"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowRight,
  ChevronRight,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { PAYU_URL } from "@/lib/constants";

interface Weight {
  value: number;
  unit: string;
}

interface OrderItemPreview {
  productName: string;
  weight?: Weight;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  items: OrderItemPreview[];
  payment: {
    status: string;
    retryCount?: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get<Order[]>("/customer/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleRetry = async (orderId: string) => {
    try {
      toast.loading("Preparing to retry payment...", { id: "payment-retry" });

      const res = await api.post(`/customer/orders/${orderId}/retry-payment`);
      const data = res.data.payu;

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYU_URL; // ✅ Dynamic URL (Live/Test)

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error: unknown) {
      console.error("Retry failed", error);

      let message = "Failed to retry payment";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as { response?: unknown }).response;

        if (
          typeof response === "object" &&
          response !== null &&
          "data" in response
        ) {
          const data = (response as { data?: unknown }).data;

          if (
            typeof data === "object" &&
            data !== null &&
            "message" in data &&
            typeof (data as { message?: unknown }).message === "string"
          ) {
            message = (data as { message: string }).message;
          }
        }
      }

      toast.error(message, { id: "payment-retry" });
    }
  };

  const isRetryAllowed = (order: Order) => {
    if (!["PAYMENT_PENDING", "PAYMENT_FAILED"].includes(order.status)) {
      return false;
    }

    if ((order.payment?.retryCount || 0) >= 1) {
      return false;
    }

    const createdAt = new Date(order.createdAt).getTime();
    const now = Date.now();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    return now - createdAt <= THREE_DAYS;
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Delivered",
          className:
            "border border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        };
      case "SHIPPED":
        return {
          label: "Shipped",
          className: "border border-blue-200 bg-blue-50 text-blue-700",
          icon: Truck,
        };
      case "PAYMENT_FAILED":
        return {
          label: "Payment Failed",
          className: "border border-rose-200 bg-rose-50 text-rose-700",
          icon: AlertCircle,
        };
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "border border-neutral-200 bg-neutral-100 text-neutral-700",
          icon: XCircle,
        };
      default:
        return {
          label: status.replaceAll("_", " "),
          className:
            "border border-amber-200 bg-amber-50 text-amber-700",
          icon: Clock3,
        };
    }
  };

  const totalItems = useMemo(() => {
    return orders.reduce((sum, order) => sum + order.items.length, 0);
  }, [orders]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <div className="w-40 h-8 rounded animate-pulse bg-neutral-200" />
          <div className="w-64 h-4 mt-3 rounded animate-pulse bg-neutral-100" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[28px] border border-border-muted/20 bg-bg-surface p-5 sm:p-6"
          >
            <div className="space-y-5 animate-pulse">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="w-20 h-3 rounded bg-neutral-100" />
                    <div className="w-24 h-4 rounded bg-neutral-200" />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div
                    key={j}
                    className="w-20 h-20 shrink-0 rounded-2xl bg-neutral-100"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="w-20 h-4 rounded bg-neutral-100" />
                <div className="w-32 h-10 rounded-full bg-neutral-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center rounded-4xl border border-dashed border-border-muted/20 bg-bg-surface px-6 py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 text-white rounded-full bg-bg-dark">
          <ShoppingBag className="h-7 w-7" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-neutral-900">
          No orders yet
        </h1>

        <p className="max-w-md mt-3 text-sm leading-6 text-neutral-500">
          You haven’t placed any orders yet. Start exploring the shop and your
          purchases will appear here once you order.
        </p>

        <button
          onClick={() => router.push("/shop")}
          className="inline-flex items-center gap-2 px-6 py-3 mt-8 text-sm font-medium text-white transition rounded-full bg-bg-dark hover:bg-bg-dark/80"
        >
          Start Shopping
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>
    );
  }

  return (
    <div className="px-3 space-y-5 sm:px-4 md:px-6 lg:px-0">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border-muted/20 bg-bg-surface p-5 lg:flex-row lg:items-end lg:justify-between lg:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">
            Orders
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Review your purchases, check statuses, and open full order details.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-row">
          <div className="px-4 py-3 border rounded-2xl border-border-muted/20 bg-neutral-50/40">
            <p className="text-xs text-neutral-500">Total Orders</p>
            <p className="text-lg font-semibold text-neutral-900">
              {orders.length}
            </p>
          </div>
          <div className="px-4 py-3 border rounded-2xl border-border-muted/20 bg-neutral-50/40">
            <p className="text-xs text-neutral-500">Products</p>
            <p className="text-lg font-semibold text-neutral-900">
              {totalItems}
            </p>
          </div>
        </div>
      </div>

      {orders.map((order) => {
        const status = getStatusMeta(order.status);
        const StatusIcon = status.icon;

        return (
          <article
            key={order._id}
            className="overflow-hidden rounded-[28px] border border-border-muted/20 bg-bg-surface transition hover:shadow-md"
          >
            <div className="px-5 py-5 border-b border-border-muted/20 bg-bg-surface/40 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-lg font-semibold text-neutral-900">
                      Order #{order.orderNumber}
                    </h2>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {status.label}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-neutral-500">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:justify-end">
                  <div className="px-4 py-3 border rounded-2xl border-border-muted/20 bg-neutral-50/40">
                    <p className="text-xs text-neutral-500">Total</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      ₹{order.grandTotal}
                    </p>
                  </div>

                  <div className="px-4 py-3 border rounded-2xl border-border-muted/20 bg-neutral-50/40">
                    <p className="text-xs text-neutral-500">Items</p>
                    <p className="mt-1 text-sm font-semibold text-neutral-900">
                      {order.items.length} item{order.items.length > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="py-5">
              <div className="flex items-start gap-4 px-5 pb-2 overflow-x-auto sm:px-6">
                {order.items.slice(0, 4).map((item, index) => (
                  <div
                    key={index}
                    className="group w-22 shrink-0"
                  >
                    <div className="relative flex items-center justify-center mb-2 overflow-hidden border h-22 w-22 rounded-2xl border-border-muted/20 bg-neutral-50">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          sizes="88px"
                          className="object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full text-neutral-400">
                          <Package className="w-5 h-5" />
                          <span className="mt-1 text-[11px]">No image</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-medium line-clamp-1 text-neutral-700">
                      {item.productName}
                    </p>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Qty {item.quantity}
                      {item.weight
                        ? ` • ${item.weight.value}${item.weight.unit}`
                        : ""}
                    </p>
                  </div>
                ))}

                {order.items.length > 4 && (
                  <div className="flex items-center justify-center text-sm font-semibold border border-dashed h-22 w-22 shrink-0 rounded-2xl border-border-muted/20 bg-neutral-50 text-neutral-600">
                    +{order.items.length - 4}
                  </div>
                )}
              </div>

              <div className="flex gap-3 px-5 pt-5 mt-6 border-t sm:px-6 border-border-muted/20 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs lg:text-sm text-neutral-500">
                  View full order details, product list, and delivery updates.
                </p>

                <div className="flex flex-wrap gap-3">
                  {isRetryAllowed(order) && (
                    <button
                      onClick={() => handleRetry(order._id)}
                      className="inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-700"
                    >
                      Retry Payment
                    </button>
                  )}

                  {order.status === "SHIPPED" && (
                    <button className="inline-flex items-center justify-center rounded-full border border-neutral-300 bg-bg-surface px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
                      Track Order
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/account/orders/${order._id}`)}
                    className="inline-flex items-center min-w-32 justify-center gap-2 rounded-full bg-bg-dark px-5 py-2.5 text-sm font-medium text-white transition hover:bg-bg-dark/80"
                  >
                    View Details
                    <ChevronRight className="hidden w-4 h-4 lg:block" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}