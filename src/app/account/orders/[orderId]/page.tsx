"use client";

import Link from "next/link";
import { customerStatusClass, customerStatusLabel } from "@/lib/orderStatus";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Image from "next/image";
import { toast } from "sonner";
import { PAYU_URL } from "@/lib/constants";
import ShipmentCard from "@/components/orders/ShipmentCard";
import { SITE_INFO, qualityIssueMailto } from "@/lib/siteInfo";
import BuyAgainButton, { canBuyAgain } from "@/components/orders/BuyAgainButton";
import type { ShipmentInfo } from "@/lib/tracking";
import DeliveryTimeline from "@/components/orders/DeliveryTimeline";

interface OrderItem {
    productId: string;
    variantId: string;
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
        paidAt?: string;
    };
    shipping?: ShipmentInfo | null;
}

export default function OrderDetailsPage() {
    const { orderId } = useParams();
    const router = useRouter();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [retryLoading, setRetryLoading] = useState(false);
    const [cancelLoading, setCancelLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

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
        if (!order || cancelLoading) return;
        try {
            setCancelLoading(true);
            const res = await api.patch(`/customer/orders/${order._id}/cancel`);
            // Reload: the refund (paid orders) changes the payment status too.
            try {
                const fresh = await api.get<Order>(`/customer/orders/${order._id}`);
                setOrder(fresh.data);
            } catch {
                setOrder({ ...order, status: "CANCELLED" });
            }
            setConfirmCancel(false);
            toast.success(res.data?.message || "Order cancelled.", { duration: 8000 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || "Failed to cancel order");
            setConfirmCancel(false);
        } finally {
            setCancelLoading(false);
        }
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
            // Show the backend's reason (e.g. the earlier payment went through or is still confirming).
            const data = (error as { response?: { data?: { message?: string; paid?: boolean } } })?.response?.data;
            if (data?.paid) {
                toast.success(data.message || "Your payment went through.");
                window.location.reload();
                return;
            }
            toast.error(data?.message || (error instanceof Error ? error.message : "Failed to retry payment"));
        } finally {
            setRetryLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        if (!order || invoiceLoading) return;

        try {
            setInvoiceLoading(true);
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
        } finally {
            setInvoiceLoading(false);
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

    const getStatusStyle = () => customerStatusClass(order.status);

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
                    {customerStatusLabel(order.status)}
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

            {order.status === "RETURNED" && (
                <div className="p-5 text-sm text-gray-700 border bg-bg-surface/80 border-border-muted/30 rounded-3xl">
                    This parcel wasn&apos;t accepted at delivery and has come back to us.
                    {order.payment?.status === "REFUNDED"
                        ? " Your refund has been sent; it usually reaches your account in 5–7 working days."
                        : " If you have any questions, please contact us."}
                </div>
            )}

            {/* ================= DELIVERY / TRACKING ================= */}
            <DeliveryTimeline
                status={order.status}
                createdAt={order.createdAt}
                paidAt={order.payment?.paidAt}
                shipping={order.shipping}
            />
            <ShipmentCard status={order.status} shipping={order.shipping} />

            {/* ================= QUALITY ISSUE ================= */}
            {order.status === "DELIVERED" && (
                <div className="flex flex-col gap-3 p-5 border sm:flex-row sm:items-center sm:justify-between bg-bg-surface/80 rounded-3xl border-border-muted/30">
                    <p className="text-sm text-gray-600">
                        <span className="font-medium text-text-primary">Problem with quality?</span>{" "}
                        Email us within {SITE_INFO.returnWindow} of delivery with photos. We don&apos;t accept returns otherwise.
                    </p>
                    <a
                        href={qualityIssueMailto(order.orderNumber)}
                        className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium border rounded-full shrink-0 border-border hover:bg-black/5"
                    >
                        Email {SITE_INFO.returnsEmail}
                    </a>
                </div>
            )}

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
                            <span>₹{Number(order.gstAmount).toFixed(2)}</span>
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

                        {canBuyAgain(order.status, order.items) && (
                            <BuyAgainButton items={order.items} className="w-full py-3" />
                        )}

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
                                {(order.payment?.retryCount || 0) >= 1
                                    ? "This order can't be paid again (one retry is allowed). "
                                    : "The 3 days to pay for this order have passed. "}
                                Your teas are still in your cart:{" "}
                                <Link href="/checkout" className="underline">place a new order</Link>.
                            </div>
                        )}

                        {/* Only these can be cancelled (the server refuses the rest). */}
                        {["PLACED", "PAYMENT_PENDING", "PAYMENT_SUCCESS"].includes(order.status)
                            && (
                                <button
                                    onClick={() => setConfirmCancel(true)}
                                    disabled={cancelLoading}
                                    className="flex items-center justify-center w-full gap-2 py-3 rounded-full cursor-pointer bg-bg-dark text-text-on-dark disabled:opacity-50"
                                >
                                    Cancel Order
                                </button>
                            )}

                        {order.payment.status === "SUCCESS" && (
                            <button
                                onClick={handleDownloadInvoice}
                                disabled={invoiceLoading}
                                className="flex items-center justify-center w-full gap-2 py-3 text-center border rounded-full cursor-pointer disabled:cursor-wait disabled:opacity-70"
                            >
                                {invoiceLoading && <div className="w-4 h-4 border-2 rounded-full animate-spin border-bg-dark border-t-transparent"></div>}
                                {invoiceLoading ? "Preparing invoice…" : "Download Invoice"}
                            </button>
                        )}
                    </div>
                </div>
                        </div>

            {/* ================= CANCEL CONFIRMATION ================= */}
            {confirmCancel && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
                    onClick={() => !cancelLoading && setConfirmCancel(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="cancel-title"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md p-6 bg-white shadow-xl rounded-3xl"
                    >
                        <h2 id="cancel-title" className="text-lg font-semibold text-text-primary">
                            Cancel order #{order.orderNumber}?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {order.payment.status === "SUCCESS"
                                ? `You'll get a full refund of ₹${Number(order.grandTotal).toFixed(2)} to your original payment method, automatically. It usually reaches your account in 5–7 working days.`
                                : "Your order will be cancelled. This can't be undone."}
                        </p>
                        <div className="flex flex-col-reverse gap-2 mt-6 sm:flex-row sm:justify-end">
                            <button
                                onClick={() => setConfirmCancel(false)}
                                disabled={cancelLoading}
                                className="px-5 py-2.5 text-sm font-medium border rounded-full cursor-pointer disabled:opacity-50"
                            >
                                Keep my order
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={cancelLoading}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-red-600 rounded-full cursor-pointer hover:bg-red-700 disabled:opacity-60"
                            >
                                {cancelLoading && <div className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent"></div>}
                                {cancelLoading ? "Cancelling…" : "Yes, cancel order"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
