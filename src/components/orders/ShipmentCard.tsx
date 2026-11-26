"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, Truck } from "lucide-react";
import { ShipmentInfo, shipmentStatusLabel, shipmentTrackingUrl } from "@/lib/tracking";

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : null;

/*
 * Courier, AWB and a "Track parcel" button on the order page.
 * Before pickup is booked it explains what happens next instead.
 */
export default function ShipmentCard({
  status,
  shipping,
}: {
  status: string;
  shipping?: ShipmentInfo | null;
}) {
  const [copied, setCopied] = useState(false);
  const awb = shipping?.awbCode || null;
  const url = shipmentTrackingUrl(shipping);
  const manual = !!shipping?.manual;

  const relevant = ["PAYMENT_SUCCESS", "READY_TO_SHIP", "SHIPPED", "DELIVERED"].includes(status);
  if (!relevant && !awb) return null;

  // Sent another way (e.g. delivered by hand) may have no tracking number.
  const showDetails = !!awb || (manual && ["SHIPPED", "DELIVERED"].includes(status));

  const copyAwb = async () => {
    if (!awb) return;
    try {
      await navigator.clipboard.writeText(awb);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available; the number is visible anyway
    }
  };

  // Own-courier parcels have no live updates here; the courier's site has them.
  const courierStatus = manual ? null : shipmentStatusLabel(shipping?.status);

  return (
    <section
      aria-labelledby="shipment-heading"
      className="p-6 border bg-bg-surface/80 border-border-muted/30 rounded-3xl sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full shrink-0 bg-bg-dark/5">
          <Truck className="w-5 h-5 text-bg-dark" aria-hidden="true" />
        </div>

        <div className="flex-1 min-w-0">
          <h2 id="shipment-heading" className="text-lg font-semibold">
            Delivery
          </h2>

          {!showDetails ? (
            <p className="mt-1 text-sm text-gray-600">
              {status === "PAYMENT_SUCCESS"
                ? "We're packing your order. You'll get an email with the tracking number as soon as it's handed to the courier."
                : "Your parcel is packed and waiting for courier pickup. The tracking number will appear here shortly."}
            </p>
          ) : (
            <>
              <dl className="grid grid-cols-1 mt-3 text-sm gap-x-6 gap-y-2 sm:grid-cols-2">
                {shipping?.courierName && (
                  <div>
                    <dt className="text-gray-500">Courier</dt>
                    <dd className="font-medium">{shipping.courierName}</dd>
                  </div>
                )}
                {awb && (
                  <div>
                    <dt className="text-gray-500">{manual ? "Tracking number" : "Tracking number (AWB)"}</dt>
                    <dd className="flex items-center gap-2 font-medium">
                      <span className="font-mono break-all">{awb}</span>
                      <button
                        type="button"
                        onClick={copyAwb}
                        className="p-1 text-gray-500 rounded hover:text-bg-dark"
                        aria-label={copied ? "Copied" : "Copy tracking number"}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </dd>
                  </div>
                )}
                {courierStatus && (
                  <div>
                    <dt className="text-gray-500">Latest update</dt>
                    <dd className="font-medium">{courierStatus}</dd>
                  </div>
                )}
                {(shipping?.deliveredAt || shipping?.shippedAt) && (
                  <div>
                    <dt className="text-gray-500">{shipping?.deliveredAt ? "Delivered on" : "Shipped on"}</dt>
                    <dd className="font-medium">{formatDate(shipping?.deliveredAt || shipping?.shippedAt)}</dd>
                  </div>
                )}
              </dl>

              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 mt-5 text-sm font-medium text-white rounded-full bg-bg-dark hover:bg-bg-dark/90"
                >
                  {manual ? `Track on ${shipping?.courierName || "courier site"}` : "Track parcel"}
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              {manual && awb && (
                <p className="mt-3 text-xs text-gray-500">
                  Copy the tracking number above and enter it on the courier&apos;s website to see where your parcel is.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
