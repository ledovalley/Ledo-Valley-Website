"use client";

import { usePathname } from "next/navigation";
import { whatsappLink } from "@/lib/siteInfo";

/* Pages where a floating button would get in the way of paying or signing in. */
const HIDDEN_ON = ["/checkout", "/payment", "/auth", "/verify-email", "/invalid-link"];

/* What the customer was looking at, so the chat starts with context. */
const messageFor = (path: string) => {
  if (/^\/shop\/[^/]+/.test(path)) {
    return `Hello Ledo Valley! I have a question about this tea: https://www.ledovalley.com${path}`;
  }
  if (path.startsWith("/account/orders/")) {
    return "Hello Ledo Valley! I have a question about my order.";
  }
  if (path.startsWith("/distributor")) {
    return "Hello Ledo Valley! I'm interested in becoming a distributor.";
  }
  return undefined;
};

const track = () => {
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "whatsapp_click", page_path: window.location.pathname });
  } catch {
    // analytics is optional
  }
};

export default function WhatsAppButton() {
  const pathname = usePathname() || "/";
  if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  const href = whatsappLink(messageFor(pathname));
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={track}
      aria-label="Chat with us on WhatsApp (opens WhatsApp)"
      title="Chat with us on WhatsApp"
      className="fixed z-30 flex items-center justify-center rounded-full shadow-lg bottom-5 right-5 w-14 h-14 bg-[#25D366] text-white transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#128C7E] print:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}
    >
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" fill="currentColor">
        <path d="M16.004 3C9.38 3 3.99 8.39 3.99 15.014c0 2.117.553 4.184 1.604 6.005L3.9 27.1l6.23-1.634a12.0 12.0 0 0 0 5.871 1.53h.005c6.623 0 12.012-5.39 12.012-12.014C28.018 8.39 22.628 3 16.004 3zm0 21.97h-.004a9.96 9.96 0 0 1-5.078-1.39l-.364-.216-3.697.97.987-3.605-.237-.37a9.94 9.94 0 0 1-1.527-5.345c0-5.505 4.479-9.984 9.986-9.984 2.667 0 5.174 1.04 7.06 2.927a9.92 9.92 0 0 1 2.922 7.062c-.002 5.506-4.481 9.951-9.988 9.951zm5.476-7.475c-.3-.15-1.775-.876-2.05-.976-.275-.1-.475-.15-.675.15-.2.3-.775.976-.95 1.176-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.413-1.49-.892-.795-1.494-1.777-1.669-2.077-.175-.3-.019-.462.131-.611.135-.134.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.675-1.627-.925-2.227-.244-.585-.491-.506-.675-.515l-.575-.01c-.2 0-.525.075-.8.375-.275.3-1.05 1.026-1.05 2.502 0 1.477 1.075 2.903 1.225 3.103.15.2 2.116 3.231 5.126 4.531.716.309 1.275.494 1.711.632.719.229 1.373.196 1.89.119.576-.086 1.775-.726 2.025-1.427.25-.7.25-1.301.175-1.426-.075-.125-.275-.2-.575-.35z" />
      </svg>
    </a>
  );
}
