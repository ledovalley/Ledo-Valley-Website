"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "PAYMENT_FAILED":
        return "bg-red-100 text-red-600";
      case "CANCELLED":
        return "bg-gray-200 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        Loading your orders...
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-semibold mb-2">
          No Orders Yet
        </h2>
        <p className="text-gray-500 mb-6">
          You haven’t placed any orders yet.
        </p>
        <button
          onClick={() => router.push("/shop")}
          className="px-6 py-3 bg-black text-white rounded-full hover:bg-black/90"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold font-playfair mb-6">
        My Orders{" "}<span className="text-lg">{"("}{`${orders.length}`}{")"}</span>
      </h1>

      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-bg-surface/80 rounded-3xl p-8 transition-all border border-border-default"
        >
          {/* ================= HEADER ================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-sm">

            <div className="w-fit">
              <p className="text-xs text-text-secondary">Order Id</p>
              <p className="font-semibold">#{order.orderNumber}</p>
            </div>

            <div className="text-right lg:text-left">
              <p className="text-xs text-text-secondary">Placed On</p>
              <p className="font-semibold">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-text-secondary">Order Total</p>
              <p className="font-semibold">₹{order.grandTotal}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-secondary">Status</p>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
              >
                {order.status.replaceAll("_", " ")}
              </span>
            </div>
          </div>

          {/* ================= PRODUCT STRIP ================= */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
            {order.items.slice(0, 4).map((item, index) => (
              <div
                key={index}
                className="
        relative
        w-20 h-20
        shrink-0
        bg-bg-surface
        border border-border-muted/20
        rounded-2xl
        overflow-hidden
      "
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.productName}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <span className="text-xs text-gray-400">
                      No Image
                    </span>
                  </div>
                )}
              </div>
            ))}

            {order.items.length > 4 && (
              <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-2xl flex items-center justify-center text-sm font-medium">
                +{order.items.length - 4}
              </div>
            )}
          </div>

          {/* ================= ACTION BUTTONS ================= */}
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {order.items.length} item
              {order.items.length > 1 ? "s" : ""}
            </p>

            <div className="flex gap-4">
              {order.status === "SHIPPED" && (
                <button
                  className="px-5 py-2 text-sm border rounded-full hover:bg-gray-50"
                >
                  Track Order
                </button>
              )}

              <button
                onClick={() =>
                  router.push(`/account/orders/${order._id}`)
                }
                className="px-6 py-2 text-sm bg-bg-dark text-white rounded-full hover:bg-bg-dark/90 cursor-pointer transition"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
