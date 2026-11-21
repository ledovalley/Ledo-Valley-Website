/* Shiprocket's public tracking page for an AWB number (works for every courier Shiprocket uses). */
export const trackingUrl = (awb?: string | null) =>
  awb ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : null;

export interface ShipmentInfo {
  awbCode?: string | null;
  courierName?: string | null;
  status?: string | null;
  pickupScheduledAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

/* Courier status words from Shiprocket ("OUT_FOR_DELIVERY") made readable. */
export const shipmentStatusLabel = (status?: string | null) =>
  status
    ? status
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : null;
