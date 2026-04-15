/**
 * PAYU CONFIGURATION
 * The URL changes based on whether you are using Test keys or Live keys.
 * Set NEXT_PUBLIC_PAYU_MODE=live in Vercel to use the Production environment.
 */
export const PAYU_TEST_URL = "https://test.payu.in/_payment";
export const PAYU_PROD_URL = "https://secure.payu.in/_payment";

export const PAYU_URL = process.env.NEXT_PUBLIC_PAYU_MODE === "live" 
  ? PAYU_PROD_URL 
  : PAYU_TEST_URL;
