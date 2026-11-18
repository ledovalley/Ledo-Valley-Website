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

  /* How long after delivery customers have to report damaged/defective items.
     Keep this in line with the backend's return window. */
  returnWindow: "24 hours",
} as const;
