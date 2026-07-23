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
        <>
          {/* Google Analytics */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-WF1GGY11SE"
            strategy="afterInteractive"
          />

          <Script id="google-analytics" strategy="afterInteractive">
            {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-WF1GGY11SE');
    `}
          </Script>

          {/* Meta Pixel Code */}
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1073788569141705');
              fbq('track', 'PageView');
            `}
          </Script>
        </>
        <SpeedInsights />
        <Analytics />
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
          <AuthProvider>
          <InitialLoader>
            <CartProvider>
              <UIProvider>
                <Toaster position="top-right" richColors />
                <ServerWakingUpOverlay />

                {/* Meta Pixel Noscript Fallback */}
                <noscript>
                  <Image
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src="https://www.facebook.com/tr?id=1073788569141705&ev=PageView&noscript=1"
                    alt=""
                  />
                </noscript>

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
