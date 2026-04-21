"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, Loader2, ShieldCheck } from "lucide-react";
import { AxiosError } from "axios";

interface ProfileResponse {
    email?: string;
    emailVerified?: boolean;
}

interface Props {
    isOpen: boolean;
    onVerified: () => void;
    onCancel: () => void;
}

export default function CheckoutEmailVerificationModal({ isOpen, onVerified, onCancel }: Props) {
    const { token } = useAuth();
    
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [email, setEmail] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    
    // Status can be: 'checking', 'needs_email', 'needs_verification', 'verified'
    const [actionLoading, setActionLoading] = useState(false);

    // Initial Load & Polling Effect
    useEffect(() => {
        if (!isOpen || !token) return;

        let pollingInterval: NodeJS.Timeout;

        const checkVerificationStatus = async () => {
            try {
                const res = await api.get<{ success: boolean, data: ProfileResponse }>("/customer/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const profileData = res.data.data;

                if (profileData.emailVerified) {
                    setIsVerified(true);
                    onVerified();
                } else if (profileData.email) {
                    setEmail(profileData.email);
                }
                
            } catch (error) {
                console.error("Failed to check verification loop", error);
            } finally {
                setLoadingProfile(false);
            }
        };

        // Check initially
        checkVerificationStatus();

        // Poll every 3 seconds only if we know they have an email but it isn't verified
        pollingInterval = setInterval(() => {
            if (!isVerified) {
                checkVerificationStatus();
            }
        }, 3000);

        return () => {
            clearInterval(pollingInterval);
        };
    }, [isOpen, token, isVerified, onVerified]);

    const isValidEmail = useMemo(() => {
        if (!email.trim()) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    }, [email]);

    const handleSendVerification = async () => {
        if (!token || !isValidEmail) return;

        try {
            setActionLoading(true);
            await api.put(
                "/customer/profile/email",
                { email: email.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success("Verification email sent! Please check your inbox.");
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message: string }>;
            toast.error(axiosError.response?.data?.message || "Failed to send verification");
        } finally {
            setActionLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-bg-surface w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
                
                {/* Header */}
                <div className="p-6 border-b border-border-muted/20 pb-5">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <ShieldCheck className="text-brand-primary" />
                        Verification Required
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        We need a verified email to send your order updates and invoice.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loadingProfile ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                            <p className="text-sm text-neutral-500">Checking profile...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    Email Address
                                </label>
                                
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-neutral-200 focus:border-neutral-900 outline-none transition"
                                    disabled={actionLoading}
                                />
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-sm">
                                <span className="relative flex h-3 w-3 mt-1 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                                <div>
                                    <p className="font-semibold mb-1">Waiting for verification</p>
                                    <p className="opacity-80">
                                        Click <b>Send Verification</b> below. A link will be sent to your inbox. Once you click it in a new tab, this window will automatically close!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-6 pt-0 flex gap-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3 px-4 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-full font-medium text-sm transition"
                    >
                        Cancel Order
                    </button>
                    {!loadingProfile && (
                       <button 
                           onClick={handleSendVerification}
                           disabled={!isValidEmail || actionLoading}
                           className="flex-1 py-3 px-4 bg-bg-dark hover:bg-bg-dark/80 text-white rounded-full font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                           {actionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                           {actionLoading ? "Sending..." : "Send Verification"}
                       </button>
                    )}
                </div>
            </div>
        </div>
    );
}
