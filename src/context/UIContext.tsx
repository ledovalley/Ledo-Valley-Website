"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

interface UIContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const UIContext = createContext<UIContextType | null>(null);

export function UIProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [isLoginOpen, setIsLoginOpen] =
    useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <UIContext.Provider
      value={{
        isLoginOpen,
        openLogin,
        closeLogin,
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
