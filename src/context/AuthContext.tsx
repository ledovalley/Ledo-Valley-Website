"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

/* ================= TYPES ================= */

export interface Customer {
  _id: string;
  phone: string;
}

interface AuthContextType {
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
  const stored = localStorage.getItem("customer");
  return stored ? JSON.parse(stored) : null;
};

/* ================= CONTEXT ================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* ================= PROVIDER ================= */

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Lazy initialization (NO useEffect needed)

  const [token, setToken] = useState<string | null>(() =>
    getStoredToken()
  );

  const [customer, setCustomer] =
    useState<Customer | null>(() =>
      getStoredCustomer()
    );

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
