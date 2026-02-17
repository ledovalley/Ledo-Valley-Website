"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { X, ArrowRight, Phone } from "lucide-react";
import { AxiosError } from "axios";
import api from "@/lib/api";

interface LoginModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({
  onClose,
  onSuccess,
}: LoginModalProps) {
  const { login } = useAuth();

  const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
  const [phone, setPhone] = useState("");
  const OTP_LENGTH = 6;
  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );

  const RESEND_TIME = 300;
  const [resendTimer, setResendTimer] =
    useState(RESEND_TIME);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* ================= SEND OTP ================= */

  const sendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/auth/customer/send-otp", {
        phone,
      });

      setStep("OTP");
    } catch (err) {
      const error =
        err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message ||
        "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP ================= */

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post(
        "/auth/customer/verify-otp",
        {
          phone,
          otp: otp.join(""),
        }
      );

      login(res.data.token, res.data.customer);

      onSuccess?.();
      onClose();
    } catch (err) {
      const error =
        err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message ||
        "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= OTP HANDLING ================= */

  const handleOtpChange = (
    value: string,
    index: number
  ) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      const next = document.getElementById(
        `otp-${index + 1}`
      );
      (next as HTMLInputElement)?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(
        `otp-${index - 1}`
      );
      (prev as HTMLInputElement)?.focus();
    }
  };

  const handleOtpPaste = (
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split("");
    setOtp([
      ...newOtp,
      ...Array(OTP_LENGTH - newOtp.length).fill(""),
    ]);
  };

  /* ================= OTP TIMER ================= */

  useEffect(() => {
    if (step !== "OTP") return;

    setResendTimer(RESEND_TIME);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  const resendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await api.post("/auth/customer/send-otp", {
        phone,
      });

      setResendTimer(RESEND_TIME);
    } catch (err) {
      const error =
        err as AxiosError<{ message?: string }>;

      setError(
        error.response?.data?.message ||
        "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-bg-page p-8 shadow-xl">
        {/* HEADER */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-playfair font-semibold">
              {step === "PHONE"
                ? "Welcome to Ledo Valley"
                : "Verify your number"}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {step === "PHONE"
                ? "Login or sign up using your phone number"
                : `OTP sent to ${phone}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* PHONE STEP */}
        {step === "PHONE" && (
          <div className="space-y-4">
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />

              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30"
                autoFocus
              />
            </div>

            <p className="text-xs py-2 text-text-secondary text-center">By continuing, I agree to the{" "}<span className="font-semibold cursor-pointer hover:underline">Terms of Use</span>{" "}&{" "}<span className="font-semibold cursor-pointer hover:underline">Privacy Policy</span>{" "}and I am above 18 years old.</p>

            <button
              onClick={sendOtp}
              disabled={
                loading || phone.length < 8
              }
              className="w-full flex items-center justify-center gap-2 rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Sending OTP…"
                : "Continue"}
              {!loading && (
                <ArrowRight size={16} />
              )}
            </button>

            <p className="text-xs pt-2 text-text-secondary text-center">Have trouble logging in?{" "}<span className="font-semibold cursor-pointer hover:underline">Contact Us</span></p>
          </div>
        )}

        {/* OTP STEP */}
        {step === "OTP" && (
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) =>
                    handleOtpChange(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleOtpKeyDown(e, index)
                  }
                  onPaste={handleOtpPaste}
                  className="w-full p-3 text-center rounded-lg border text-lg font-medium focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30"
                />
              ))}
            </div>

            <button
              onClick={verifyOtp}
              disabled={
                loading ||
                otp.some((d) => d === "")
              }
              className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? "Verifying…"
                : "Verify & Login"}
            </button>

            <div className="flex justify-between items-center text-xs text-text-secondary">
              <button
                onClick={() =>
                  setStep("PHONE")
                }
                className="hover:underline cursor-pointer"
              >
                Change number
              </button>

              {resendTimer > 0 ? (
                <span>
                  Resend in{" "}
                  {formatTime(resendTimer)}
                </span>
              ) : (
                <button
                  onClick={resendOtp}
                  className="text-(--color-brand-primary) hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <p className="text-xs pt-2 text-text-secondary text-center">Have trouble logging in?{" "}<span className="font-semibold cursor-pointer hover:underline">Contact Us</span></p>
          </div>
        )}

        {error && (
          <p className="mt-5 text-sm text-warning text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
