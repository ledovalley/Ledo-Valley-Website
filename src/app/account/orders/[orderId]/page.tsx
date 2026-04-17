"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";
import { PAYU_URL } from "@/lib/constants";

interface OrderItem {
    productName: string;
    weight?: {
        value: number;
        unit: string;
    };
    quantity: number;
    finalPrice: number;
    subtotal: number;
    image?: string;
}

interface ShippingAddress {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
}

interface Order {
    _id: string;
    orderNumber: string;
    grandTotal: number;
    itemsTotal: number;
    gstAmount: number;
    shippingAmount: number;
    discountAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    payment: {
        status: string;
        retryCount?: number;
    };
}

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [retryLoading, setRetryLoading] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get<Order>(
                    `/customer/orders/${orderId}`
                );
                setOrder(res.data);
            } catch (err) {
                console.error("Failed to fetch order", err);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrder();
    }, [orderId]);

    const handleCancel = async () => {
        if (!order) return;
        await api.patch(`/customer/orders/${order._id}/cancel`);
        router.refresh();
    };

    const isRetryAllowed = () => {
        if (!order) return false;

        if (
            !["PAYMENT_PENDING", "PAYMENT_FAILED"].includes(order.status)
        ) return false;

        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();
        const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;

        if (now - createdAt > SEVENTY_TWO_HOURS) return false;

        if ((order.payment?.retryCount || 0) >= 1) return false;

        return true;
    };

    const handleRetry = async () => {
        if (!order || retryLoading) return;

        try {
            setRetryLoading(true);

            const res = await api.post(
                `/customer/orders/${order._id}/retry-payment`
            );

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
            toast.error(error instanceof Error ? error.message : "Failed to retry payment");
        } finally {
            setRetryLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!order) return;

        try {
            const res = await api.get(
                `/customer/orders/${order._id}/invoice`,
                { responseType: "blob" }
            );
            const url = window.URL.createObjectURL(res.data);
            const link = document.createElement("a");

            link.href = url;
            link.download = `${order.orderNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error("Failed to download invoice");
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                Loading order details...
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                Order not found.
            </div>
        );
    }

    /* ================= STATUS COLORS ================= */

    const getStatusStyle = () => {
        switch (order.status) {
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

    return (
        <div className="pt-3 space-y-6">
            {/* ================= BACK BUTTON ================= */}
            <button
                onClick={() => router.push("/account/orders")}
                className="items-center hidden gap-2 mb-6 text-sm text-gray-500 cursor-pointer hover:text-black md:flex"
            >
                ← Back to Orders
            </button>

            {/* ================= HEADER ================= */}
            <div className="flex flex-col gap-4 pb-6 border-b sm:flex-row sm:justify-between sm:items-center border-border-muted/20">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Order #{order.orderNumber}
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                </div>

                <span
                    className={`px-4 py-1 w-fit text-sm font-medium rounded-full ${getStatusStyle()}`}
                >
                    {order.status.replaceAll("_", " ")}
                </span>
            </div>

            {/* ================= MODERN TIMELINE ================= */}
            <div className="p-6 border bg-bg-surface/80 border-border-muted/30 rounded-3xl sm:p-8">
                <div className="relative flex items-center justify-between text-xs sm:text-sm">

                    {/* Progress Line */}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />

                    <div
                        className={`absolute top-4 left-0 h-0.5 bg-black transition-all duration-500 ${order.status === "DELIVERED"
                            ? "w-full"
                            : order.status === "SHIPPED"
                                ? "w-2/3"
                                : "w-1/3"
                            }`}
                    />

                    {/* Step 1 */}
                    <div className="relative flex-1 text-center">
                        <div className="flex items-center justify-center w-8 h-8 mx-auto text-xs font-semibold text-white rounded-full bg-bg-dark">
                            ✓
                        </div>
                        <p className="mt-3 text-xs">Placed</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative flex-1 text-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto ${["SHIPPED", "DELIVERED"].includes(order.status)
                                ? "bg-bg-dark text-white"
                                : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            2
                        </div>
                        <p className="mt-3 text-xs">Shipped</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative flex-1 text-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto ${order.status === "DELIVERED"
                                ? "bg-bg-dark text-white"
                                : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            3
                        </div>
                        <p className="mt-3 text-xs">Delivered</p>
                    </div>
                </div>
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 sm:gap-8">

                {/* LEFT SIDE */}
                <div className="space-y-6 lg:col-span-2">
                    {/* SHIPPING */}
                    <div className="p-6 border bg-bg-surface/80 rounded-3xl sm:p-8 border-border-muted/30">
                        <h2 className="mb-4 text-lg font-semibold">
                            Shipping Address
                        </h2>

                        <p className="font-medium">
                            {order.shippingAddress.name}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.addressLine2 &&
                                `, ${order.shippingAddress.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.pincode}
                        </p>
                        <p className="mt-3 text-sm">
                            Phone: {order.shippingAddress.phone}
                        </p>
                    </div>

                    {/* ITEMS */}
                    <div className="p-6 border bg-bg-surface/80 rounded-3xl sm:p-8 border-border-muted/30">
                        <h2 className="text-lg font-semibold">
                            Order Items
                        </h2>

                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-4 py-6 border-b  sm:gap-6 sm:items-center last:border-0 border-border-muted/20"
                            >
                                {/* IMAGE */}
                                <div
                                    className="relative w-20 h-20 overflow-hidden bg-white border  sm:w-24 sm:h-24 shrink-0 rounded-2xl border-border-muted/20"
                                >
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.productName}
                                            fill
                                            sizes="96px"
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">

                                    <div className="flex justify-between gap-2 sm:items-start sm:gap-4">

                                        {/* LEFT TEXT */}
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">
                                                {item.productName}
                                            </p>

                                            {item.weight && (
                                                <p className="text-sm text-gray-500">
                                                    {item.weight.value} {item.weight.unit}
                                                </p>
                                            )}

                                            <p className="text-sm">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>

                                        {/* PRICE */}
                                        <div className="font-semibold sm:text-right">
                                            ₹{item.subtotal}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-6 lg:sticky lg:top-28">

                    {/* SUMMARY */}
                    <div className="p-6 space-y-4 border bg-bg-surface/80 rounded-3xl sm:p-8 border-border-muted/30">
                        <h2 className="text-lg font-semibold">
                            Payment Summary
                        </h2>

                        <div className="flex justify-between text-sm">
                            <span>Items Total</span>
                            <span>₹{order.itemsTotal}</span>
                        </div>

                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Discount</span>
                                <span>- ₹{order.discountAmount}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span>GST included</span>
                            <span>₹{order.gstAmount}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>₹{order.shippingAmount}</span>
                        </div>

                        <div className="flex justify-between pt-4 text-lg font-semibold border-t">
                            <span>Total</span>
                            <span>₹{order.grandTotal}</span>
                        </div>
                    </div>

                    {/* ACTIONS */}
                    <div className="space-y-4">

                        {isRetryAllowed() && (
                            <button
                                onClick={handleRetry}
                                disabled={retryLoading}
                                className="w-full py-3 text-white transition rounded-full bg-bg-dark hover:bg-bg-dark/90 disabled:opacity-50"
                            >
                                {retryLoading ? "Processing..." : "Retry Payment"}
                            </button>
                        )}

                        {order.status === "PAYMENT_FAILED" && !isRetryAllowed() && (
                            <div className="text-sm text-center text-red-500">
                                { (order.payment?.retryCount || 0) >= 3 
                                    ? "Maximum retry attempts reached (3)" 
                                    : "Retry window expired (3 days)" }
                            </div>
                        )}

                        {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)
                            && (
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-3 rounded-full cursor-pointer bg-bg-dark text-text-on-dark"
                                >
                                    Cancel Order
                                </button>
                            )}

                        {order.payment.status === "SUCCESS" && (
                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full py-3 text-center border rounded-full"
                            >
                                Download Invoice
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
