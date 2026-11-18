import type { Metadata } from "next";
import ReturnsPolicyContent from "./ReturnsPolicyContent";

export const metadata: Metadata = {
  title: "Returns & Refund Policy",
  description:
    "How to report a damaged or defective Ledo Valley tea order, and how refunds and replacements work.",
  alternates: { canonical: "https://www.ledovalley.com/returns-refund-policy" },
};

export default function ReturnsRefundPolicyPage() {
  return <ReturnsPolicyContent />;
}
