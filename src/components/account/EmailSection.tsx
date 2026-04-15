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
      .get("/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userEmail = res.data.email || "";
        setEmail(userEmail);
        setInitialEmail(userEmail);
        setVerified(!!res.data.emailVerified);
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
        <div className="animate-pulse space-y-5">
          <div className="h-6 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-64 rounded bg-neutral-100" />
          <div className="h-24 rounded-2xl bg-neutral-100" />
          <div className="h-12 w-40 rounded-full bg-neutral-200" />
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
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Verified
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
              <AlertCircle className="h-4 w-4" />
              Pending verification
            </span>
          )
        ) : null}
      </div>

      <div className="mt-6 rounded-3xl border border-border-default bg-neutral-50 p-4 sm:p-5">
        <label
          htmlFor="email"
          className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-700"
        >
          <Mail className="h-4 w-4" />
          Email address
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-full border border-neutral-300 bg-white py-3 pl-11 pr-4 text-sm text-neutral-900 outline-none transition-all placeholder:text-neutral-400 focus:border-neutral-900 focus:ring-4 focus:ring-neutral-200"
            />
          </div>

          <button
            onClick={handleUpdateEmail}
            disabled={loading || !emailChanged || !isValidEmail}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-bg-dark px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Sending..." : verified ? "Update Email" : "Send Verification"}
          </button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm text-neutral-600">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          <p>
            If you change your email, we’ll send a verification link to the new
            address before it becomes fully verified.
          </p>
        </div>
      </div>

      {email && (
        <div className="mt-5 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-3">
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