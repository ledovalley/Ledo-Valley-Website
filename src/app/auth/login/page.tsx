"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Phone, User, ArrowRight } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { isValidPhone } from "@/lib/validatePhone";

type Step = 
  | "LOGIN" 
  | "REGISTER" 
  | "VERIFY_EMAIL_OTP" 
  | "FORGOT_PASSWORD" 
  | "RESET_PASSWORD" 
  | "LEGACY_PHONE" 
  | "LEGACY_OTP"
  | "GOOGLE_PHONE";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [step, setStep] = useState<Step>("LOGIN");

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    
    // Google Temp State
    const [googleTempToken, setGoogleTempToken] = useState("");

    // OTP State
    const OTP_LENGTH = 6;
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    
    // Legacy State
    const [legacyPhone, setLegacyPhone] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /* ================= RESET STATE ================= */
    const changeStep = (newStep: Step) => {
      setStep(newStep);
      setError("");
      setOtp(Array(OTP_LENGTH).fill(""));
    };

    /* ================= API CALLS ================= */

    const handleLogin = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/customer/login", { email, password });
        login(res.data.token, res.data.customer);
        router.push("/");
      } catch (err) {
        const error = err as AxiosError<{ message?: string; unverified?: boolean }>;
        setError(error.response?.data?.message || "Login failed");
      } finally {
        setLoading(false);
      }
    };

    const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidPhone(phone)) {
        setError("Please enter a valid 10-digit phone number without repeating patterns.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      try {
        setLoading(true);
        setError("");
        await api.post("/auth/customer/register", { name, email, phone, password, confirmPassword });
        changeStep("VERIFY_EMAIL_OTP");
        toast.success("OTP sent to your email!");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Registration failed");
      } finally {
        setLoading(false);
      }
    };

    const handleVerifyEmailOtp = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/customer/verify-email-otp", { email, otp: otp.join("") });
        login(res.data.token, res.data.customer);
        toast.success("Email verified successfully!");
        router.push("/");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Invalid OTP");
      } finally {
        setLoading(false);
      }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError("");
        await api.post("/auth/customer/forgot-password", { email });
        changeStep("RESET_PASSWORD");
        toast.success("Reset OTP sent to your email!");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Failed to send reset OTP");
      } finally {
        setLoading(false);
      }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);
        setError("");
        await api.post("/auth/customer/reset-password", { email, otp: otp.join(""), newPassword: password });
        toast.success("Password reset successful. You can now login.");
        changeStep("LOGIN");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Failed to reset password");
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/customer/google-login", { token: credentialResponse.credential });
        if (res.status === 202 && res.data.action === "COLLECT_PHONE") {
          setGoogleTempToken(res.data.googleToken);
          changeStep("GOOGLE_PHONE");
          toast.info(res.data.message);
        } else {
          login(res.data.token, res.data.customer);
          router.push("/");
        }
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Google Login failed");
      } finally {
        setLoading(false);
      }
    };

    const handleGoogleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isValidPhone(phone)) {
        setError("Please enter a valid 10-digit phone number without repeating patterns.");
        return;
      }
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/customer/google-signup", { 
          token: googleTempToken, 
          phone 
        });
        login(res.data.token, res.data.customer);
        toast.success("Account created successfully!");
        router.push("/");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Google Signup failed");
      } finally {
        setLoading(false);
      }
    };

    const handleLegacySendOtp = async () => {
      try {
        setLoading(true);
        setError("");
        await api.post("/auth/customer/send-otp", { phone: legacyPhone });
        changeStep("LEGACY_OTP");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Failed to send SMS OTP");
      } finally {
        setLoading(false);
      }
    };

    const handleLegacyVerifyOtp = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.post("/auth/customer/verify-otp", { phone: legacyPhone, otp: otp.join("") });
        login(res.data.token, res.data.customer);
        router.push("/");
      } catch (err) {
        const error = err as AxiosError<{ message?: string }>;
        setError(error.response?.data?.message || "Invalid OTP");
      } finally {
        setLoading(false);
      }
    };

    /* ================= OTP HANDLING ================= */
    const handleOtpChange = (value: string, index: number) => {
      if (!/^\d?$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < OTP_LENGTH - 1) {
        const next = document.getElementById(`page-otp-${index + 1}`);
        (next as HTMLInputElement)?.focus();
      }
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === "Backspace" && !otp[index] && index > 0) {
        const prev = document.getElementById(`page-otp-${index - 1}`);
        (prev as HTMLInputElement)?.focus();
      }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
      if (!/^\d+$/.test(pasted)) return;
      const newOtp = pasted.split("");
      setOtp([...newOtp, ...Array(OTP_LENGTH - newOtp.length).fill("")]);
    };

    return (
        <section className="min-h-screen flex items-center justify-center bg-(--color-bg-page) px-6 py-12">
            <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-sm">
                
                {/* HEADER */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-playfair font-semibold">
                      {step === "LOGIN" && "Welcome to Ledo Valley"}
                      {step === "REGISTER" && "Create an Account"}
                      {(step === "VERIFY_EMAIL_OTP" || step === "LEGACY_OTP") && "Verify OTP"}
                      {step === "FORGOT_PASSWORD" && "Reset Password"}
                      {step === "RESET_PASSWORD" && "Enter New Password"}
                      {step === "LEGACY_PHONE" && "Legacy Login"}
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">
                      {step === "LOGIN" && "Login to your account"}
                      {step === "REGISTER" && "Sign up to explore premium teas"}
                      {step === "VERIFY_EMAIL_OTP" && `OTP sent to ${email}`}
                      {step === "FORGOT_PASSWORD" && "Enter your email to receive an OTP"}
                      {step === "RESET_PASSWORD" && `Reset OTP sent to ${email}`}
                      {step === "LEGACY_PHONE" && "Login using SMS OTP (Existing Users)"}
                      {step === "LEGACY_OTP" && `OTP sent to ${legacyPhone}`}
                    </p>
                </div>

                {/* --- LOGIN VIEW --- */}
                {step === "LOGIN" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" autoFocus />
                    </div>
                    
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>

                    <div className="flex justify-end">
                      <button type="button" onClick={() => changeStep("FORGOT_PASSWORD")} className="text-xs text-(--color-brand-primary) hover:underline cursor-pointer">Forgot Password?</button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Logging in…" : "Login"} {!loading && <ArrowRight size={16} />}
                    </button>
                    
                    <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
                      <p className="mx-4 mb-0 text-center text-xs font-semibold text-gray-500">OR</p>
                    </div>

                    <div className="flex justify-center w-full">
                       <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Login Failed")}
                        shape="pill"
                        size="large"
                        width="300"
                        useOneTap
                      />
                    </div>

                    <p className="text-xs pt-4 text-center">Don't have an account? <button type="button" onClick={() => changeStep("REGISTER")} className="font-semibold text-(--color-brand-primary) cursor-pointer hover:underline">Sign up</button></p>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("LEGACY_PHONE")} className="text-text-secondary cursor-pointer hover:underline">Login with Phone (Existing Users)</button></p>
                  </form>
                )}

                {/* --- REGISTER VIEW --- */}
                {step === "REGISTER" && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-full border pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-full border pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="tel" placeholder="Phone Number" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-full border pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-full border pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="password" placeholder="Confirm Password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-full border pl-11 pr-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>

                    <p className="text-xs text-text-secondary text-center">By continuing, I agree to the <span className="font-semibold cursor-pointer hover:underline">Terms of Use</span> & <span className="font-semibold cursor-pointer hover:underline">Privacy Policy</span>.</p>

                    <button type="submit" disabled={loading} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Registering…" : "Sign Up"}
                    </button>

                    <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
                      <p className="mx-4 mb-0 text-center text-xs font-semibold text-gray-500">OR</p>
                    </div>

                    <div className="flex justify-center w-full">
                       <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError("Google Login Failed")}
                        shape="pill"
                        size="large"
                        width="300"
                        text="signup_with"
                        useOneTap
                      />
                    </div>

                    <p className="text-xs pt-4 text-center">Already have an account? <button type="button" onClick={() => changeStep("LOGIN")} className="font-semibold text-(--color-brand-primary) cursor-pointer hover:underline">Login</button></p>
                  </form>
                )}

                {/* --- FORGOT PASSWORD VIEW --- */}
                {step === "FORGOT_PASSWORD" && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="email" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" autoFocus />
                    </div>
                    <button type="submit" disabled={loading} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Sending…" : "Send Reset OTP"}
                    </button>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("LOGIN")} className="text-(--color-brand-primary) hover:underline cursor-pointer">Back to Login</button></p>
                  </form>
                )}

                {/* --- RESET PASSWORD VIEW --- */}
                {step === "RESET_PASSWORD" && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input key={index} id={`page-otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className="w-10 h-10 text-center rounded-lg border text-lg font-medium focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                      ))}
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="password" placeholder="New Password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                    </div>
                    <button type="submit" disabled={loading || otp.some((d) => d === "")} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Resetting…" : "Reset Password"}
                    </button>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("LOGIN")} className="text-(--color-brand-primary) hover:underline cursor-pointer">Back to Login</button></p>
                  </form>
                )}

                {/* --- GOOGLE PHONE VIEW --- */}
                {step === "GOOGLE_PHONE" && (
                  <form onSubmit={handleGoogleSignup} className="space-y-4">
                    <div className="text-center space-y-2 mb-6">
                      <h3 className="text-xl font-semibold font-playfair text-text-primary">Almost Done!</h3>
                      <p className="text-sm text-text-secondary">Please enter your phone number to complete registration. This is required for shipping updates.</p>
                    </div>

                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="tel" placeholder="Enter phone number" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" autoFocus />
                    </div>
                    
                    <button type="submit" disabled={loading || phone.length < 10} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Creating Account…" : "Complete Registration"}
                    </button>
                  </form>
                )}

                {/* --- VERIFY EMAIL OTP VIEW --- */}
                {step === "VERIFY_EMAIL_OTP" && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input key={index} id={`page-otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className="w-10 h-10 text-center rounded-lg border text-lg font-medium focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                      ))}
                    </div>
                    <button onClick={handleVerifyEmailOtp} disabled={loading || otp.some((d) => d === "")} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Verifying…" : "Verify & Login"}
                    </button>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("REGISTER")} className="text-(--color-brand-primary) hover:underline cursor-pointer">Back to Register</button></p>
                  </div>
                )}

                {/* --- LEGACY PHONE VIEW --- */}
                {step === "LEGACY_PHONE" && (
                  <div className="space-y-4">
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input type="tel" placeholder="Enter phone number" value={legacyPhone} onChange={(e) => setLegacyPhone(e.target.value)}
                        className="w-full rounded-full border pl-11 pr-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" autoFocus />
                    </div>
                    <button onClick={handleLegacySendOtp} disabled={loading || legacyPhone.length < 8} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Sending SMS…" : "Send OTP"}
                    </button>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("LOGIN")} className="text-(--color-brand-primary) hover:underline cursor-pointer">Back to Login</button></p>
                  </div>
                )}

                {/* --- LEGACY OTP VIEW --- */}
                {step === "LEGACY_OTP" && (
                  <div className="space-y-4">
                     <div className="flex justify-center gap-2">
                      {otp.map((digit, index) => (
                        <input key={index} id={`page-otp-${index}`} type="text" inputMode="numeric" maxLength={1} value={digit}
                          onChange={(e) => handleOtpChange(e.target.value, index)}
                          onKeyDown={(e) => handleOtpKeyDown(e, index)}
                          onPaste={handleOtpPaste}
                          className="w-10 h-10 text-center rounded-lg border text-lg font-medium focus:outline-none focus:ring-2 focus:ring-(--color-brand-primary)/30" />
                      ))}
                    </div>
                    <button onClick={handleLegacyVerifyOtp} disabled={loading || otp.some((d) => d === "")} className="w-full rounded-full bg-(--color-brand-primary) text-(--color-text-on-dark) py-3 text-sm font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer">
                      {loading ? "Verifying…" : "Verify & Login"}
                    </button>
                    <p className="text-xs text-center"><button type="button" onClick={() => changeStep("LEGACY_PHONE")} className="text-(--color-brand-primary) hover:underline cursor-pointer">Change Number</button></p>
                  </div>
                )}

                {/* ERROR DISPLAY */}
                {error && <p className="mt-5 text-sm text-warning text-center">{error}</p>}
            </div>
        </section>
    );
}
