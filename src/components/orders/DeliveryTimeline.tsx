"use client";

import { Check } from "lucide-react";
import { ShipmentInfo, shipmentStatusLabel } from "@/lib/tracking";

const day = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : null;
const dayTime = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : null;

/* Friendlier names for the courier's status codes. */
const FRIENDLY: Record<string, string> = {
  PICKUP_SCHEDULED: "Pickup booked",
  PICKUP_GENERATED: "Pickup booked",
  OUT_FOR_PICKUP: "Courier on the way to collect it",
  PICKED_UP: "Picked up by the courier",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In transit",
  REACHED_AT_DESTINATION_HUB: "Reached your city",
  REACHED_DESTINATION_HUB: "Reached your city",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  UNDELIVERED: "Delivery attempt failed",
  DELAYED: "Delayed",
};
const friendly = (s: string) => FRIENDLY[s] || shipmentStatusLabel(s) || s;

interface Props {
  status: string;
  createdAt: string;
  paidAt?: string | null;
  shipping?: ShipmentInfo | null;
}

const SHOWN = ["PAYMENT_SUCCESS", "READY_TO_SHIP", "SHIPPED", "DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED"];

/**
 * Where the order is, step by step, with the expected delivery date and
 * the courier's latest updates.
 */
export default function DeliveryTimeline({ status, createdAt, paidAt, shipping }: Props) {
  if (!SHOWN.includes(status)) return null;

  const events = (shipping?.events || []).filter((e) => !String(e.status).startsWith("RTO"));
  const findEvent = (...codes: string[]) => events.find((e) => codes.includes(e.status))?.at || null;
  const delivered = ["DELIVERED", "RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED"].includes(status);
  const shipped = delivered || status === "SHIPPED";
  const manual = !!shipping?.manual;

  const outForDeliveryAt = findEvent("OUT_FOR_DELIVERY");
  const steps = [
    { label: "Order placed", at: createdAt, done: true },
    { label: "Payment confirmed", at: paidAt || null, done: true },
    // Paid: being packed. Pickup booked (Shiprocket): packed, waiting for the courier.
    { label: "Being packed", at: null, done: status !== "PAYMENT_SUCCESS" },
    ...(manual
      ? []
      : [{ label: "Packed, waiting for the courier", at: shipping?.pickupScheduledAt || null, done: shipped }]),
    {
      label: shipping?.courierName ? `Shipped with ${shipping.courierName}` : "Shipped",
      at: shipping?.shippedAt || findEvent("PICKED_UP", "SHIPPED", "IN_TRANSIT"),
      done: shipped,
    },
    ...(manual ? [] : [{ label: "Out for delivery", at: outForDeliveryAt, done: delivered || !!outForDeliveryAt }]),
    { label: "Delivered", at: shipping?.deliveredAt || null, done: delivered },
  ];
  const current = steps.findIndex((s) => !s.done);

  const etd = !delivered && shipping?.etd ? day(shipping.etd) : null;
  const latest = [...events].reverse().slice(0, 6);

  return (
    <div className="p-5 border sm:p-6 bg-bg-surface/80 rounded-3xl border-border-muted/30">
      <div className="flex flex-col gap-1 mb-5 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="text-base font-semibold text-text-primary">Delivery</h2>
        {etd && (
          <p className="text-sm text-gray-600">
            Expected by <span className="font-semibold text-text-primary">{etd}</span>
            {shipping?.etdSource === "estimate" ? " (estimate)" : ""}
          </p>
        )}
      </div>

      <ol className="relative space-y-4">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          return (
            <li key={s.label} className="relative flex gap-3">
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute left-[11px] top-6 h-[calc(100%-4px)] w-0.5 ${s.done ? "bg-bg-dark" : "bg-gray-200"}`}
                />
              )}
              <span
                className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  s.done
                    ? "border-bg-dark bg-bg-dark text-white"
                    : isCurrent
                    ? "border-bg-dark bg-white"
                    : "border-gray-300 bg-white"
                }`}
              >
                {s.done ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <span className="w-2 h-2 rounded-full bg-bg-dark" /> : null}
              </span>
              <div className="pb-1">
                <p className={`text-sm ${s.done || isCurrent ? "font-medium text-text-primary" : "text-gray-500"}`}>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : isCurrent ? " (next)" : ""}</span>
                </p>
                {s.at && s.done && <p className="text-xs text-gray-500">{dayTime(s.at)}</p>}
              </div>
            </li>
          );
        })}
      </ol>

      {latest.length > 0 && (
        <details className="mt-5 group">
          <summary className="text-sm font-medium cursor-pointer text-bg-dark">Courier updates</summary>
          <ul className="mt-3 space-y-2">
            {latest.map((e, i) => (
              <li key={`${e.status}-${i}`} className="text-sm">
                <span className="font-medium text-text-primary">{friendly(e.status)}</span>
                {e.location ? <span className="text-gray-600"> · {e.location}</span> : null}
                <span className="block text-xs text-gray-500">{dayTime(e.at)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
