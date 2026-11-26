"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SITE_INFO } from "@/lib/siteInfo";

const FAQS = [
  {
    question: "What is the difference between Black Tea and Green Tea?",
    answer: "Black Tea is fully oxidized for a strong, robust flavor, while Green Tea is unoxidized, keeping it light and rich in antioxidants."
  },
  {
    question: "How much time does it take for delivery?",
    answer: "Orders are typically processed within 24 hours and delivered within 3–5 business days depending on your location."
  },
  {
    question: "What are the return or exchange policies?",
    answer: `We don't accept returns or exchanges, except for quality issues. If your order arrives damaged, defective or wrong, email ${SITE_INFO.returnsEmail} within ${SITE_INFO.returnWindow} of delivery with your order number and photos, and keep the original packaging. Once we've verified it, we'll refund or replace it. See our Returns & Refund Policy for details.`
  },
  {
    question: "Who do I contact for Bulk Orders?",
    answer: `For bulk or wholesale inquiries, email ${SITE_INFO.email} or call ${SITE_INFO.phoneDisplay} for our latest B2B price list.`
  },
  {
    question: "What are the accepted payment methods?",
    answer: "We accept UPI, Credit/Debit Cards, and Net Banking through our secure payment partner."
  },
  {
    question: "Do I need to login for order placement?",
    answer: "Yes. Before placing an order you'll log in or create an account with your email or Google, so you can track your order and download invoices."
  }
];

export default function ShopFAQ() {
    const [activeIndex, setActiveIndex] = useState<number | null>(0);

    const toggleFAQ = (index: number) => {
        setActiveIndex(index === activeIndex ? null : index);
    };

    return (
        <section id="faq" className="bg-bg-page py-16 mt-16 scroll-mt-28">
            <div className="container mx-auto px-6">
                <h3 className="text-5xl font-playfair mb-8">
                    FAQ
                </h3>

                <div className="space-y-4">
                    {FAQS.map((faq, index) => {
                        const isOpen = index === activeIndex;

                        return (
                            <div
                                key={index}
                                className="border-b overflow-hidden"
                            >
                                {/* Question */}
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between py-4 text-left cursor-pointer transition"
                                >
                                    <span className="font-semibold">
                                        {faq.question}
                                    </span>

                                    <ChevronDown
                                        size={18}
                                        className={`transition-transform ${isOpen ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {/* Answer */}
                                <div
                                    className={`grid transition-all duration-300 ease-in-out ${isOpen
                                        ? "grid-rows-[1fr] opacity-100"
                                        : "grid-rows-[0fr] opacity-0"
                                        }`}
                                >
                                    <div className="overflow-hidden pb-4 text-sm text-text-secondary">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
