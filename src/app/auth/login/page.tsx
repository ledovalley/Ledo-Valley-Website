"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";

export default function LoginPage() {
    const router = useRouter();

    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendOtp = async () => {
        try {
            setLoading(true);
            setError("");

            await api.post("/customer/auth/send-otp", { phone });
            setStep("OTP");
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setError(error.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await api.post("/auth/customer/verify-otp", {
                phone,
                otp,
            });

            localStorage.setItem("customerToken", res.data.token);
            localStorage.setItem("customer", JSON.stringify(res.data.customer));

            router.push("/");
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;
            setError(error.response?.data?.message || "Invalid OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-(--color-bg-page) px-6">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm">
                <h1 className="text-2xl font-playfair text-center mb-6">
                    Login to Ledo Valley
                </h1>

                {step === "PHONE" && (
                    <>
                        <label className="block text-sm mb-2">Phone Number</label>
                        <input
                            type="tel"
                            placeholder="Enter your phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full border rounded-full px-4 py-3 text-sm mb-4 focus:outline-none"
                        />

                        <button
                            onClick={sendOtp}
                            disabled={loading}
                            className="w-full bg-(--color-brand-primary) text-(--color-text-on-dark) rounded-full py-3 text-sm font-medium"
                        >
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </>
                )}

                {step === "OTP" && (
                    <>
                        <label className="block text-sm mb-2">Enter OTP</label>
                        <input
                            type="text"
                            placeholder="6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full border rounded-full px-4 py-3 text-sm mb-4 focus:outline-none tracking-widest text-center"
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={loading}
                            className="w-full bg-(--color-brand-primary) text-(--color-text-on-dark) rounded-full py-3 text-sm font-medium"
                        >
                            {loading ? "Verifying..." : "Verify & Login"}
                        </button>

                        <button
                            onClick={() => setStep("PHONE")}
                            className="mt-4 text-sm text-center w-full text-text-secondary"
                        >
                            Change phone number
                        </button>
                    </>
                )}

                {error && (
                    <p className="mt-4 text-sm text-warning text-center">
                        {error}
                    </p>
                )}
            </div>
        </section>
    );
}
