import axios from "axios";
import { getCustomerToken, logoutCustomer } from "./customerAuth";
import { toast } from "sonner";

// Since we need to access UI state, we'll store a reference to the setter
// This is a common pattern to keep API logic separate from React hooks
let setIsServerWakingUp: ((val: boolean) => void) | null = null;

export const setWakeUpObserver = (fn: (val: boolean) => void) => {
  setIsServerWakingUp = fn;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 second timeout
});

// Track active requests to clear wake-up state
let activeRequests = 0;
let wakeUpTimer: NodeJS.Timeout | null = null;

const clearWakeUpTimer = () => {
  if (wakeUpTimer) {
    clearTimeout(wakeUpTimer);
    wakeUpTimer = null;
  }
};

/* =========================
   REQUEST INTERCEPTOR
========================= */

api.interceptors.request.use((config) => {
  const token = getCustomerToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  activeRequests++;

  // If this is the first request in a while, start a timer to detect "Cold Starts"
  if (activeRequests === 1 && setIsServerWakingUp) {
    clearWakeUpTimer();
    wakeUpTimer = setTimeout(() => {
      if (activeRequests > 0 && setIsServerWakingUp) {
        setIsServerWakingUp(true);
      }
    }, 7000); // Trigger after 7 seconds of silence
  }

  return config;
});

/* =========================
   RESPONSE INTERCEPTOR
========================= */

api.interceptors.response.use(
  (response) => {
    activeRequests--;
    if (activeRequests === 0) {
      clearWakeUpTimer();
      setIsServerWakingUp?.(false);
    }
    return response;
  },
  (error) => {
    activeRequests--;
    if (activeRequests === 0) {
      clearWakeUpTimer();
      setIsServerWakingUp?.(false);
    }

    if (error.response?.status === 401) {
      logoutCustomer();
    }

    // Global Error Toasts
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        toast.error("The server is taking too long to respond. Please try again in a few seconds.");
      } else if (!error.response) {
        toast.error("Network Error: Please check your internet connection.");
      } else if (error.response.status >= 500) {
        toast.error("Server Error: We're having trouble reaching our services. Please try again later.");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
