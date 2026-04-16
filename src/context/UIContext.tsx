"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { setWakeUpObserver } from "@/lib/api";

interface UIContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  isServerWakingUp: boolean;
  setIsServerWakingUp: (val: boolean) => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoginOpen, setIsLoginOpen] =
    useState(false);
  const [isServerWakingUp, setIsServerWakingUp] =
    useState(false);

  useEffect(() => {
    setWakeUpObserver(setIsServerWakingUp);
  }, []);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <UIContext.Provider
      value={{
        isLoginOpen,
        openLogin,
        closeLogin,
        isServerWakingUp,
        setIsServerWakingUp,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error(
      "useUI must be used inside UIProvider"
    );
  }

  return context;
};
