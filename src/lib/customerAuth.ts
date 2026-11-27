export const getCustomerToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken");
};

export const getCustomer = () => {
  if (typeof window === "undefined") return null;
  const customer = localStorage.getItem("customer");
  return customer ? JSON.parse(customer) : null;
};

export const isCustomerLoggedIn = (): boolean => {
  return !!getCustomerToken();
};

export const logoutCustomer = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("customerToken");
  localStorage.removeItem("customer");
};

/*
 * Ending a login that has expired (or was rejected by the server).
 * The website keeps a login in this browser until the server says it's no
 * longer valid. When that happens, endCustomerSession() clears it and tells
 * AuthContext, so the site shows the visitor as logged out (and asks them to
 * log in again) instead of looking logged in while nothing works.
 */
export const SESSION_EXPIRED_EVENT = "lv:session-expired";

export const endCustomerSession = () => {
  if (typeof window === "undefined") return;
  logoutCustomer();
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};

/* True if a saved login token has passed its expiry time (read from the token itself). */
export const tokenExpired = (token: string | null): boolean => {
  if (!token) return false;
  try {
    const part = token.split(".")[1];
    if (!part) return false;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(b64 + "===".slice((b64.length + 3) % 4)));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
};
