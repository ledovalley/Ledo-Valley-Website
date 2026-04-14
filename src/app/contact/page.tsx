// Metadata is provided via app/contact/layout.tsx
"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";


export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await api.post("/customer/contact", formData);

            setSuccess(true);

            setFormData({
                fullName: "",
                companyName: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="bg-background text-text-primary pt-32 pb-20">
            {/* ================= HERO ================= */}
            <section className="bg-linear-to-b from-muted/30 to-background">
                <div className="container mx-auto px-6 text-center max-w-4xl">
                    <h1 className="text-3xl md:text-5xl font-semibold font-playfair tracking-tight">
                        Contact <span className="text-primary">Ledo Valley</span>
                    </h1>
                    <p className="mt-4 md:mt-6 text-base md:text-lg text-text-muted">
                        Have a bulk requirement, technical query, or partnership inquiry?
                        Our team is here to assist you professionally.
                    </p>
                </div>
            </section>

            {/* ================= FORM ================= */}
            <section className="container mx-auto px-4 sm:px-6 py-14">
                <div className="flex justify-center">
                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-3xl space-y-6 bg-bg-surface/60 border border-border p-6 sm:p-10 rounded-3xl shadow-sm"
                    >
                        <div className="text-center">
                            <h2 className="text-2xl md:text-3xl font-semibold font-playfair">
                                Send Us an Inquiry
                            </h2>
                            <p className="mt-2 text-sm md:text-base text-text-muted">
                                We respond within 24 business hours.
                            </p>
                        </div>

                        {/* Row 1 */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Input
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                            />
                            <Input
                                label="Company Name"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Row 2 */}
                        <div className="grid sm:grid-cols-2 gap-6">
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <Input
                            label="Subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                        />

                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <textarea
                                name="message"
                                rows={5}
                                required
                                value={formData.message}
                                onChange={handleChange}
                                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            />
                        </div>

                        {/* Feedback */}
                        {error && (
                            <p className="text-red-500 text-sm text-center">{error}</p>
                        )}

                        {success && (
                            <p className="text-green-600 text-sm text-center">
                                Inquiry submitted successfully.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-full bg-bg-dark text-text-on-dark py-3 font-medium hover:opacity-90 transition disabled:opacity-60"
                        >
                            {loading ? "Submitting..." : "Submit Inquiry"}
                        </button>
                    </form>
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="bg-primary text-text-primary py-14 text-center">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h3 className="text-xl md:text-2xl font-semibold font-playfair">
                        Reliable Supply. Transparent Communication.
                    </h3>
                    <p className="mt-2 text-text-primary/90 text-sm md:text-base">
                        Partner with Ledo Valley for quality industrial solutions delivered
                        on time.
                    </p>
                </div>
            </section>

            {/* ================= INFO CARDS ================= */}
            <section className="container mx-auto px-4 sm:px-6 py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <InfoCard
                        icon={<Phone className="w-6 h-6 text-primary" />}
                        title="Call Us"
                        text="+91 70990-38036"
                    />
                    <InfoCard
                        icon={<Mail className="w-6 h-6 text-primary" />}
                        title="Email"
                        text="contact@ledovalley.com"
                    />
                    <InfoCard
                        icon={<MapPin className="w-6 h-6 text-primary" />}
                        title="Office"
                        text="Unit No. 7C Cosmo Plaza Market, AT Road, Tinsukia, Assam - 786125"
                    />
                    <InfoCard
                        icon={<Clock className="w-6 h-6 text-primary" />}
                        title="Working Hours"
                        text="Mon – Sat, 9:00 AM – 6:00 PM"
                    />
                </div>
            </section>
        </main>
    );
}

/* ================= REUSABLE COMPONENTS ================= */

import React from "react";
import api from "@/lib/api";

interface InputProps {
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    required?: boolean;
}

function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    required = false,
}: InputProps) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input
                type={type}
                name={name}
                required={required}
                value={value}
                onChange={onChange}
                className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>
    );
}


interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    text: string;
}

function InfoCard({ icon, title, text }: InfoCardProps) {
    return (
        <div className="rounded-2xl border border-border-muted/30 p-6 bg-bg-surface/80 hover:shadow-lg transition">
            <div className="bg-bg-dark/20 w-fit p-4 rounded-xl">{icon}</div>
            <h3 className="mt-4 font-semibold text-lg font-playfair">{title}</h3>
            <p className="text-text-muted mt-2 text-sm">{text}</p>
        </div>
    );
}
