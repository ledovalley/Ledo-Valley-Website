"use client";

import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <main className="bg-background text-text-primary pt-36 pb-20">

            {/* ================= HERO ================= */}
            <section className="bg-linear-to-b from-muted/30 to-background">
                <div className="container mx-auto px-6 max-w-4xl text-center">
                    <h1 className="text-3xl md:text-5xl font-playfair font-semibold tracking-tight">
                        Privacy Policy
                    </h1>
                    <p className="mt-4 text-text-muted text-sm md:text-base">
                        Effective Date: 15th February 2026
                    </p>
                </div>
            </section>

            {/* ================= CONTENT ================= */}
            <section className="container mx-auto px-6 mt-14 max-w-4xl">
                <div className="space-y-12 text-sm md:text-base leading-relaxed text-text-muted">

                    {/* INTRO */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Introduction
                        </h2>
                        <p className="mt-4">
                            Ledovalley.com is committed to protecting the privacy of visitors to this site (the “Site”).
                            We aim to provide an enjoyable and secure experience while respecting and protecting your
                            personal information in accordance with this Privacy Policy.
                        </p>
                        <p className="mt-4">
                            This Privacy Policy applies solely to this Website and does not extend to third-party websites
                            linked from our Site.
                        </p>
                        <p className="mt-4 font-medium text-text-primary">
                            Note: Our privacy policy may be updated from time to time without prior notice.
                            Please review this page periodically.
                        </p>
                    </div>

                    {/* CONSENT */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Your Consent
                        </h2>
                        <p className="mt-4">
                            By using this Website, you agree to the terms of this Privacy Policy.
                            If you do not agree, please refrain from using the Website.
                        </p>
                        <p className="mt-4">
                            Your continued use of the Website constitutes your consent to the collection
                            and use of information in accordance with this policy.
                        </p>
                    </div>

                    {/* INFORMATION COLLECTED */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Information We Collect
                        </h2>

                        <ul className="list-disc pl-6 mt-4 space-y-3">
                            <li>
                                Personal information such as Name, Email Address and Phone Number during registration.
                            </li>
                            <li>
                                Billing and shipping addresses, payment details and transaction information when making purchases.
                            </li>
                            <li>
                                Preferences and demographic details when voluntarily provided.
                            </li>
                            <li>
                                Automatically collected data such as browser type, IP address, usage patterns and cookies.
                            </li>
                        </ul>

                        <p className="mt-4">
                            Cookies and similar technologies help us improve your browsing experience.
                            You may disable cookies in your browser settings, but some features of the Site may not function properly.
                        </p>
                    </div>

                    {/* HOW WE USE INFO */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            How We Use Your Information
                        </h2>

                        <p className="mt-4">
                            We use your information to:
                        </p>

                        <ul className="list-disc pl-6 mt-4 space-y-3">
                            <li>Process and fulfill orders</li>
                            <li>Provide customer support</li>
                            <li>Improve our services and website performance</li>
                            <li>Send promotional updates and service notifications</li>
                            <li>Personalize your shopping experience</li>
                        </ul>

                        <p className="mt-4">
                            We may share information with trusted third-party service providers
                            who assist in operating our business, including hosting, analytics,
                            email communications and order fulfillment.
                        </p>

                        <p className="mt-4">
                            We may also disclose information when required by law,
                            court order or to protect our legal rights.
                        </p>
                    </div>

                    {/* DATA SHARING */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Business Transfers
                        </h2>
                        <p className="mt-4">
                            In the event of a merger, acquisition or corporate restructuring,
                            your information may be transferred as part of the business assets.
                        </p>
                    </div>

                    {/* DATA SECURITY */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Data Protection & Security
                        </h2>
                        <p className="mt-4">
                            We implement reasonable technical and organizational measures to safeguard your data.
                            Sensitive information, including payment details, is transmitted securely using SSL encryption.
                        </p>
                        <p className="mt-4">
                            While no system is entirely secure, we strive to protect your information
                            using industry-standard security practices.
                        </p>
                    </div>

                    {/* ACCESS & UPDATE */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Access & Updating Information
                        </h2>
                        <p className="mt-4">
                            Registered users may update their personal information or communication preferences
                            by contacting us at:
                        </p>

                        <p className="mt-4 font-medium text-text-primary">
                            contact@ledovalley.com
                        </p>

                        <p className="mt-4">
                            We will take commercially reasonable steps to process opt-out requests promptly.
                            However, it may take up to ten business days for changes to take effect.
                        </p>
                    </div>

                    {/* CONTACT */}
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold font-playfair text-text-primary">
                            Contact Us
                        </h2>
                        <p className="mt-4">
                            If you have questions regarding this Privacy Policy,
                            please contact us at:
                        </p>

                        <p className="mt-4 font-medium text-text-primary">
                            sales@ledovalley.com
                        </p>
                    </div>

                </div>
            </section>

            {/* ================= FOOTER CTA ================= */}
            <section className="mt-20 bg-primary py-14 text-center text-text-primary">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h3 className="text-xl md:text-2xl font-playfair font-semibold">
                        Transparency. Trust. Reliability.
                    </h3>
                    <p className="mt-3 text-sm md:text-base opacity-90">
                        Ledo Valley is committed to maintaining your trust and protecting your data.
                    </p>
                    <Link
                        href="/"
                        className="inline-block mt-6 px-8 py-3 rounded-full bg-bg-dark hover:bg-bg-dark/90 text-text-on-dark cursor-pointer text-sm font-medium hover:opacity-90 transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </section>
        </main>
    );
}
