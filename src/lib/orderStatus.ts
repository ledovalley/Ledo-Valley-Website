/*
 * What customers see for each order status (order list and order page).
 * Paid orders read "being packed" until the pickup is booked, then
 * "packed, waiting for the courier", then "Shipped".
 */
export const CUSTOMER_STATUS_LABEL: Record<string, string> = {
  PLACED: "Order placed",
  PAYMENT_PENDING: "Awaiting payment",
  PAYMENT_FAILED: "Payment failed",
  PAYMENT_SUCCESS: "Confirmed · being packed",
  READY_TO_SHIP: "Packed · waiting for courier",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return requested",
  RETURN_APPROVED: "Return approved",
  RETURN_REJECTED: "Return not approved",
  REFUNDED: "Refunded",
  RETURNED: "Returned (not delivered)",
};

export const customerStatusLabel = (status: string) =>
  CUSTOMER_STATUS_LABEL[status] ?? status.replaceAll("_", " ").toLowerCase();

/** Badge colours: cancelled / failed in red so they stand out. */
export const customerStatusClass = (status: string) => {
  switch (status) {
    case "DELIVERED":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700";
    case "SHIPPED":
      return "border border-blue-200 bg-blue-50 text-blue-700";
    case "CANCELLED":
    case "PAYMENT_FAILED":
      return "border border-red-200 bg-red-50 text-red-700";
    case "RETURNED":
    case "REFUNDED":
      return "border border-neutral-200 bg-neutral-100 text-neutral-700";
    default:
      return "border border-amber-200 bg-amber-50 text-amber-700";
  }
};
