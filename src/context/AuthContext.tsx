"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { toast } from "sonner";
import { SESSION_EXPIRED_EVENT, tokenExpired } from "@/lib/customerAuth";

/* ================= TYPES ================= */

export interface Customer {
  _id: string;
  phone: string;
  email?: string;
  name?: string;
  googleId?: string;
  emailVerified?: boolean;
}

interface AuthContextType {
  /** False until the saved login has been read from this browser. */
  authReady: boolean;
  isLoggedIn: boolean;
  customer: Customer | null;
  token: string | null;
  login: (token: string, customer: Customer) => void;
  logout: () => void;
}

/* ================= SAFE STORAGE HELPERS ================= */

const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customerToken");
};

const getStoredCustomer = (): Customer | null => {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem("customer");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // The saved login is read after the first render so the server-rendered
  // page and the first browser render match (no hydration mismatch now that
  // pages are no longer hidden behind the splash screen).
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    try {
      const saved = getStoredToken();
      if (tokenExpired(saved)) {
        // An old login from a previous visit: start logged out.
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customer");
      } else {
        setToken(saved);
        setCustomer(getStoredCustomer());
      }
    } catch {
      // storage unavailable: treat as logged out
    }
    setAuthReady(true);
  }, []);

  /* The server refused the login (expired): show the visitor as logged out. */
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;
  useEffect(() => {
    const onExpired = () => {
      if (!tokenRef.current) return; // already logged out (several requests can fail at once)
      tokenRef.current = null;
      setToken(null);
      setCustomer(null);
      toast.info("Your login has expired. Please log in again.");
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, []);

  const isLoggedIn = !!token;

  /* ================= LOGIN ================= */

  const login = useCallback(
    (newToken: string, newCustomer: Customer) => {
      localStorage.setItem("customerToken", newToken);
      localStorage.setItem(
        "customer",
        JSON.stringify(newCustomer)
      );

      setToken(newToken);
      setCustomer(newCustomer);
    },
    []
  );

  /* ================= LOGOUT ================= */

  const logout = useCallback(() => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customer");

    setToken(null);
    setCustomer(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authReady,
        isLoggedIn,
        customer,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================= HOOK ================= */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context)
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  return context;
};
