import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Ledo Valley",
    template: "%s | Ledo Valley",
  },
  description:
    "Ledo Valley Tea brings honest, high-quality Assam tea directly from the heart of Assam to your everyday moments.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`
          ${geistSans.variable}
          ${geistMono.variable}
          ${playfair.variable}
          font-sans
          antialiased
          bg-bg-page
        `}
      >
        <AuthProvider>
          <CartProvider>
            <UIProvider>
              <Toaster position="top-right" richColors />
              <AppShell>{children}</AppShell>
              <Footer />
            </UIProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
