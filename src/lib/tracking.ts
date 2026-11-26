/* Shiprocket's public tracking page for an AWB number (works for every courier Shiprocket uses). */
export const trackingUrl = (awb?: string | null) =>
  awb ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : null;

export interface ShipmentInfo {
  awbCode?: string | null;
  /* Sent outside Shiprocket (e.g. India Post), with the courier's own tracking page. */
  manual?: boolean;
  trackingUrl?: string | null;
  courierName?: string | null;
  status?: string | null;
  pickupScheduledAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  /* Expected delivery: from the courier, or our estimate at pickup booking. */
  etd?: string | null;
  etdSource?: "courier" | "estimate" | null;
  /* Courier updates, oldest first. */
  events?: { at: string; status: string; location?: string }[];
}

/* Where the customer tracks this parcel: the link staff entered, else Shiprocket's page. */
export const shipmentTrackingUrl = (shipping?: ShipmentInfo | null) => {
  if (shipping?.trackingUrl) return shipping.trackingUrl;
  if (shipping?.manual) return null;
  return trackingUrl(shipping?.awbCode);
};

/* Courier status words from Shiprocket ("OUT_FOR_DELIVERY") made readable. */
export const shipmentStatusLabel = (status?: string | null) =>
  status
    ? status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;
