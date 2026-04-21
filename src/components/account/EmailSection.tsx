"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function EmailSection() {
  const { token } = useAuth();

  const [email, setEmail] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!token) return;

    setFetching(true);

    api
      .get<{ success: boolean; data: any }>("/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const profileData = res.data.data;
        const userEmail = profileData.email || "";
        setEmail(userEmail);
        setInitialEmail(userEmail);
        setVerified(!!profileData.emailVerified);
      })
      .catch(() => {
        toast.error("Failed to load email details");
      })
      .finally(() => {
        setFetching(false);
      });
  }, [token]);

  const emailChanged = useMemo(() => {
    return email.trim() !== initialEmail.trim();
  }, [email, initialEmail]);

  const isValidEmail = useMemo(() => {
    if (!email.trim()) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleUpdateEmail = async () => {
    if (!token || !isValidEmail) return;

    try {
      setLoading(true);

      await api.put(
        "/customer/profile/email",
        { email: email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInitialEmail(email.trim());
      setVerified(false);
      toast.success("Verification email sent");
    } catch {
      toast.error("Failed to update email");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-5 animate-pulse">
          <div className="w-32 h-6 rounded bg-neutral-200" />
          <div className="w-64 h-4 rounded bg-neutral-100" />
          <div className="h-24 rounded-2xl bg-neutral-100" />
          <div className="w-40 h-12 rounded-full bg-neutral-200" />
        </div>
      </div>
    );
  }

  return (
    <section className="rounded-[28px] border border-border-muted/20 bg-bg-surface p-6 shadow-sm transition-all sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">Email</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Update your email address for login, notifications, and account
            verification.
          </p>
        </div>

        {email ? (
          verified ? (
            <span className="inline-flex items-center self-start gap-2 px-3 py-1 text-sm font-medium border rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center self-start gap-2 px-3 py-1 text-sm font-medium border rounded-full border-amber-200 bg-amber-50 text-amber-700">
              <AlertCircle className="w-4 h-4" />
              Pending verification
            </span>
          )
        ) : null}
      </div>

      <div className="p-4 mt-6 border rounded-3xl border-border-default bg-neutral-50/40 sm:p-5">
        <label
          htmlFor="email"
          className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-700"
        >
          <Mail className="w-4 h-4" />
          Email address
        </label>

        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Mail className="absolute w-4 h-4 -translate-y-1/2 pointer-events-none left-4 top-1/2 text-neutral-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full py-3 pr-4 text-sm transition-all border rounded-full outline-none bg-neutral-50/50 border-neutral-300 pl-11 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-200"
            />
          </div>

          <button
            onClick={handleUpdateEmail}
            disabled={loading || !emailChanged || !isValidEmail}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all rounded-full min-w-40 bg-bg-dark hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Sending..." : verified ? "Update Email" : "Send Verification"}
          </button>
        </div>

        <div className="flex items-start gap-2 px-4 py-3 mt-3 text-sm rounded-2xl text-neutral-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          <p>
            If you change your email, we’ll send a verification link to the new
            address before it becomes fully verified.
          </p>
        </div>
      </div>

      {email && (
        <div className="px-4 py-3 mt-5 border border-dashed rounded-2xl border-neutral-200 bg-neutral-50/50">
          <p className="text-sm text-neutral-600">
            Current status:{" "}
            {verified ? (
              <span className="font-medium text-emerald-700">
                Your email is verified.
              </span>
            ) : (
              <span className="font-medium text-amber-700">
                Your email is not verified yet. Please check your inbox.
              </span>
            )}
          </p>
        </div>
      )}
    </section>
  );
}