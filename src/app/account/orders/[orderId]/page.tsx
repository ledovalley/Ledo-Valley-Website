"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";

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
    invoiceUrl?: string;
    payment: {
        status: string;
    };
}

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

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

    const handleRetry = async () => {
        if (!order) return;

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
        <div className="pt-3 space-y-10">

            {/* ================= BACK BUTTON ================= */}
            <button
                onClick={() => router.push("/account/orders")}
                className="text-sm text-gray-500 cursor-pointer hover:text-black mb-6 flex items-center gap-2"
            >
                ← Back to Orders
            </button>

            {/* ================= HEADER ================= */}
            <div className="flex justify-between items-center border-b pb-6">
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
                    className={`px-4 py-1 text-sm font-medium rounded-full ${getStatusStyle()}`}
                >
                    {order.status.replaceAll("_", " ")}
                </span>
            </div>

            {/* ================= MODERN TIMELINE ================= */}
            <div className="bg-bg-surface/80 border border-border-muted/30 rounded-3xl p-8">
                <div className="relative flex items-center justify-between">

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
            <div className="grid lg:grid-cols-3 gap-10">

                {/* LEFT SIDE */}
                <div className="lg:col-span-2 space-y-8">
                    {/* SHIPPING */}
                    <div className="bg-bg-surface/80 rounded-3xl p-8 border border-border-muted/30">
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
                    <div className="bg-bg-surface/80 rounded-3xl p-8 border border-border-muted/30">
                        <h2 className="text-lg font-semibold mb-6">
                            Order Items
                        </h2>

                        {order.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex gap-6 items-center py-6 border-b last:border-0 border-border-muted/20"
                            >
                                <div className="w-24 h-24 bg-white rounded-2xl overflow-hidden flex items-center justify-center border border-border-muted/20">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.productName}
                                            width={80}
                                            height={80}
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <span className="text-xs text-gray-400">
                                            No Image
                                        </span>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <p className="font-medium">
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

                                <div className="text-right font-semibold">
                                    ₹{item.subtotal}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="space-y-8">

                    {/* SUMMARY */}
                    <div className="bg-bg-surface/80 rounded-3xl p-8 border border-border-muted/30 space-y-4">
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

                        {order.status === "PAYMENT_FAILED" && (
                            <button
                                onClick={handleRetry}
                                className="w-full py-3 bg-bg-dark text-white rounded-full"
                            >
                                Retry Payment
                            </button>
                        )}

                        {["PAYMENT_PENDING", "PAYMENT_SUCCESS"].includes(
                            order.status
                        ) && (
                                <button
                                    onClick={handleCancel}
                                    className="w-full py-3 bg-bg-dark text-text-on-dark cursor-pointer rounded-full"
                                >
                                    Cancel Order
                                </button>
                            )}

                        {order.invoiceUrl && (
                            <a
                                href={order.invoiceUrl}
                                target="_blank"
                                className="block text-center py-3 border rounded-full"
                            >
                                Download Invoice
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
