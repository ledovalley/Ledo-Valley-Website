import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import Script from "next/script";

import Footer from "@/components/layout/Footer";
import AppShell from "@/components/layout/AppShell";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import InitialLoader from "@/components/layout/InitialLoader";
import ServerWakingUpOverlay from "@/components/layout/ServerWakingUpOverlay";
import Image from "next/image";
import { GoogleOAuthProvider } from "@react-oauth/google";

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

const BASE_URL = "https://www.ledovalley.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "Ledo Valley | Premium Assam Tea — Buy Online",
    template: "%s | Ledo Valley",
  },

  description:
    "Buy premium Assam tea online from Ledo Valley. Sourced directly from the heart of Assam since 1968. Shop Black Tea, Green Tea, Organic Tea & more. Free shipping available.",

  keywords: [
    "assam tea", "buy assam tea online", "ledo valley tea",
    "premium black tea india", "organic assam tea", "green tea assam",
    "tinsukia tea brand", "assam tea online shopping",
  ],

  authors: [{ name: "Ledo Valley", url: BASE_URL }],
  creator: "Ledo Valley",
  publisher: "Ledo Valley",

  alternates: {
    canonical: BASE_URL,
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Ledo Valley",
    title: "Ledo Valley | Premium Assam Tea — Buy Online",
    description:
      "Buy premium Assam tea online from Ledo Valley. Sourced directly from the heart of Assam since 1968. Shop Black Tea, Green Tea, Organic Tea & more.",
    images: [
      {
        url: "/og-banner1.jpeg",
        width: 1200,
        height: 630,
        alt: "Ledo Valley — Premium Assam Tea Since 1968",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Ledo Valley | Premium Assam Tea — Buy Online",
    description:
      "Buy premium Assam tea online from Ledo Valley. Sourced directly from the heart of Assam since 1968.",
    images: ["/og-banner1.jpeg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-IN">
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
          {/* Google Tag Manager */}
          {process.env.NEXT_PUBLIC_GTM_ID && (
            <Script id="google-tag-manager" strategy="afterInteractive">
              {`
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
              `}
            </Script>
          )}
        <SpeedInsights />
        <Analytics />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
          <InitialLoader>
            <CartProvider>
              <UIProvider>
                <Toaster position="top-right" richColors />
                <ServerWakingUpOverlay />

                {/* Google Tag Manager (noscript) */}
                {process.env.NEXT_PUBLIC_GTM_ID && (
                  <noscript>
                    <iframe
                      src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                      height="0"
                      width="0"
                      style={{ display: "none", visibility: "hidden" }}
                    />
                  </noscript>
                )}

                <AppShell>{children}</AppShell>
                <Footer />
              </UIProvider>
            </CartProvider>
          </InitialLoader>
        </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
