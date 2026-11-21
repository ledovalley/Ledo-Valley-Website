/*
 * Business details used across the site. Change them here once and every
 * page (FAQ, policies, contact, footer) stays consistent.
 */
export const SITE_INFO = {
  email: "contact@ledovalley.com",
  phoneDisplay: "+91 70990-38036",
  phoneHref: "tel:+917099038036",
  address: "Unit No. 7C Cosmo Plaza Market, AT Road, Tinsukia, Assam - 786125",
  mapsHref:
    "https://www.google.com/maps/search/?api=1&query=Cosmo+Plaza+Market+AT+Road+Tinsukia+Assam+786125",
  hours: "Mon – Sat, 9:00 AM – 6:00 PM",

  /* WhatsApp chat button. Country code + number, digits only.
     Can be overridden without a code change with NEXT_PUBLIC_WHATSAPP_NUMBER;
     set that to "off" to hide the button. */
  whatsappNumber: "917099038036",
  whatsappGreeting: "Hello Ledo Valley! I have a question.",

  /* How long after delivery customers have to report damaged/defective items.
     Keep this in line with the backend's return window. */
  returnWindow: "24 hours",
} as const;

/* Link that opens a WhatsApp chat with us, or null if WhatsApp is switched off. */
export const whatsappLink = (message: string = SITE_INFO.whatsappGreeting): string | null => {
  const configured = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").trim();
  if (configured.toLowerCase() === "off") return null;
  const digits = (configured || SITE_INFO.whatsappNumber).replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
};
