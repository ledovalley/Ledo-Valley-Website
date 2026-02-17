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

export default function PaymentFailedPage() {
    const [order, setOrder] = useState<OrderSummary | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchLatestOrder = async () => {
            try {
                const res = await api.get<OrderSummary[]>("/customer/orders");

                const failedOrder = res.data.find(
                    (o) => o.status === "PAYMENT_FAILED"
                );

                if (failedOrder) {
                    setOrder(failedOrder);
                }
            } catch (err) {
                console.error("Failed to load order", err);
            }
        };

        fetchLatestOrder();
    }, []);

    const handleRetry = async () => {
        if (!order) return;

        try {
            setLoading(true);

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
        } catch (err) {
            console.error("Retry failed", err);
        } finally {
            setLoading(false);
        }
    };

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                No failed order found.
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
                Payment Failed ❌
            </h1>

            <p className="mb-2">
                Order Number: <strong>{order.orderNumber}</strong>
            </p>

            <p className="mb-6">
                Amount: ₹{order.grandTotal}
            </p>

            <div className="flex gap-4">
                <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="px-6 py-3 bg-black text-white rounded-full"
                >
                    {loading ? "Retrying..." : "Retry Payment"}
                </button>

                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 border rounded-full"
                >
                    Go Home
                </button>
            </div>
        </div>
    );
}
