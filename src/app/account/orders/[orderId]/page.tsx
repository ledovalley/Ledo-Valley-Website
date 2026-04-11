"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";

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
        if (
            order?.status !== "PAYMENT_FAILED" ||
            order?.payment?.status !== "FAILED"
        ) return false;

        const createdAt = new Date(order.createdAt).getTime();
        const now = Date.now();

        const diff = now - createdAt;

        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        return diff <= TWENTY_FOUR_HOURS;
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
                className="hidden text-sm text-gray-500 cursor-pointer hover:text-black mb-6 md:flex items-center gap-2"
            >
                ← Back to Orders
            </button>

            {/* ================= HEADER ================= */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-border-muted/20 pb-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Order #{order.orderNumber}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
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
            <div className="bg-bg-surface/80 border border-border-muted/30 rounded-3xl p-6 sm:p-8">
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
                    <div className="relative text-center flex-1">
                        <div className="w-8 h-8 rounded-full bg-bg-dark text-white flex items-center justify-center text-xs font-semibold mx-auto">
                            ✓
                        </div>
                        <p className="text-xs mt-3">Placed</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative text-center flex-1">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto ${["SHIPPED", "DELIVERED"].includes(order.status)
                                ? "bg-bg-dark text-white"
                                : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            2
                        </div>
                        <p className="text-xs mt-3">Shipped</p>
                    </div>

                    {/* Step 3 */}
                    <div className="relative text-center flex-1">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mx-auto ${order.status === "DELIVERED"
                                ? "bg-bg-dark text-white"
                                : "bg-gray-200 text-gray-500"
                                }`}
                        >
                            3
                        </div>
                        <p className="text-xs mt-3">Delivered</p>
                    </div>
                </div>
            </div>

            {/* ================= MAIN GRID ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SHIPPING */}
                    <div className="bg-bg-surface/80 rounded-3xl p-6 sm:p-8 border border-border-muted/30">
                        <h2 className="text-lg font-semibold mb-4">
                            Shipping Address
                        </h2>

                        <p className="font-medium">
                            {order.shippingAddress.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                            {order.shippingAddress.addressLine1}
                            {order.shippingAddress.addressLine2 &&
                                `, ${order.shippingAddress.addressLine2}`}
                        </p>
                        <p className="text-sm text-gray-600">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.pincode}
                        </p>
                        <p className="text-sm mt-3">
                            Phone: {order.shippingAddress.phone}
                        </p>
                    </div>

                    {/* ITEMS */}
                    <div className="bg-bg-surface/80 rounded-3xl p-6 sm:p-8 border border-border-muted/30">
                        <h2 className="text-lg font-semibold">
                            Order Items
                        </h2>

                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="
                                    flex
                                    gap-4 sm:gap-6
                                    items-start sm:items-center
                                    py-6
                                    border-b last:border-0
                                    border-border-muted/20
                                "
                            >
                                {/* IMAGE */}
                                <div
                                    className="
                                        relative
                                        w-20 h-20 sm:w-24 sm:h-24
                                        shrink-0
                                        bg-white
                                        rounded-2xl
                                        overflow-hidden
                                        border border-border-muted/20
                                        "
                                >
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.productName}
                                            fill
                                            sizes="96px"
                                            className="object-contain p-2"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center w-full h-full text-xs text-gray-400">
                                            No Image
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div className="flex-1 min-w-0">

                                    <div className="flex justify-between sm:items-start gap-2 sm:gap-4">

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
                    <div className="bg-bg-surface/80 rounded-3xl p-6 sm:p-8 border border-border-muted/30 space-y-4">
                        <h2 className="text-lg font-semibold">
                            Payment Summary
                        </h2>

                        <div className="flex justify-between text-sm">
                            <span>Items Total</span>
                            <span>₹{order.itemsTotal}</span>
                        </div>

                        {order.discountAmount > 0 && (
                            <div className="flex justify-between text-green-600 text-sm">
                                <span>Discount</span>
                                <span>- ₹{order.discountAmount}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm">
                            <span>GST</span>
                            <span>₹{order.gstAmount}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>Shipping</span>
                            <span>₹{order.shippingAmount}</span>
                        </div>

                        <div className="border-t pt-4 flex justify-between font-semibold text-lg">
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
                                className="w-full py-3 bg-bg-dark text-white rounded-full hover:bg-bg-dark/90 transition disabled:opacity-50"
                            >
                                {retryLoading ? "Processing..." : "Retry Payment"}
                            </button>
                        )}

                        {order.status === "PAYMENT_FAILED" && !isRetryAllowed() && (
                            <div className="text-sm text-red-500 text-center">
                                Retry window expired (24 hours)
                            </div>
                        )}

                        {!["SHIPPED", "DELIVERED", "CANCELLED"].includes(order.status)
                            && (
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-3 bg-bg-dark text-text-on-dark cursor-pointer rounded-full"
                                >
                                    Cancel Order
                                </button>
                            )}

                        {order.payment.status === "SUCCESS" && (
                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full text-center py-3 border rounded-full"
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
