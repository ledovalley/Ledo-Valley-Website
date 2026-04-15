"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, Phone, User, Mail, Loader2 } from "lucide-react";

interface CustomerProfile {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
}

export default function ProfileSection() {
  const { token } = useAuth();

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    setLoading(true);

    api
      .get<CustomerProfile>("/customer/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name || "");
      })
      .catch(() => {
        toast.error("Failed to load profile");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      const res = await api.put<CustomerProfile>(
        "/customer/profile",
        { name: name.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data);
      setName(res.data.name || "");
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = useMemo(() => {
    const source = profile?.name?.trim() || "U";
    return source
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile?.name]);

  const hasChanges = (profile?.name || "") !== name.trim();

  if (loading) {
    return (
      <div className="p-6 bg-white border shadow-sm rounded-3xl border-neutral-200 sm:p-8">
        <div className="space-y-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-neutral-200" />
            <div className="space-y-2">
              <div className="w-32 h-4 rounded bg-neutral-200" />
              <div className="w-48 h-3 rounded bg-neutral-100" />
            </div>
          </div>
          <div className="grid gap-4">
            <div className="h-20 rounded-2xl bg-neutral-100" />
            <div className="h-20 rounded-2xl bg-neutral-100" />
            <div className="h-20 rounded-2xl bg-neutral-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <section className="rounded-[28px] border border-border-muted/20 bg-bg-surface p-6 shadow-sm transition-all sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-16 h-16 text-lg font-semibold text-white rounded-full shadow-sm md:hidden bg-bg-dark">
            {initials}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Basic Information
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Manage your personal details and account identity.
            </p>
          </div>
        </div>

        <div className="inline-flex items-center self-start gap-2 px-3 py-1 text-sm font-medium text-center border rounded-full border-emerald-200 bg-emerald-50 text-emerald-700">
          <CheckCircle2 className="block w-4 h-4 md:hidden lg:block" />
          Account active
        </div>
      </div>

      <div className="grid gap-4 mt-8">
        <div className="p-4 border rounded-2xl border-neutral-200 bg-neutral-50/50 sm:p-5">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-500">
            <Phone className="w-4 h-4" />
            Registered Phone
          </div>
          <p className="text-base font-semibold tracking-tight text-neutral-900">
            {profile.phone}
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            This number is linked to your account.
          </p>
        </div>

        {profile.email && (
          <div className="p-4 border rounded-2xl border-neutral-200 bg-neutral-50/50 sm:p-5">
            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-500">
              <Mail className="w-4 h-4" />
              Email Address
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold tracking-tight text-neutral-900">
                {profile.email}
              </p>

              {profile.emailVerified && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Verified
                </span>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border bg-neutral-50/50 rounded-2xl border-neutral-200 sm:p-5">
          <label
            htmlFor="name"
            className="flex items-center gap-2 mb-2 text-sm font-medium text-neutral-700"
          >
            <User className="w-4 h-4" />
            Full Name
          </label>

          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 text-sm transition-all border outline-none rounded-2xl border-neutral-300 bg-neutral-50/50 text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:ring-4 focus:ring-neutral-200"
          />

          <p className="mt-2 text-xs text-neutral-500">
            This name may be shown in your account and orders.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-6 mt-6 border-t border-neutral-200 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-neutral-500">
          {hasChanges
            ? "You have unsaved changes."
            : "Your profile information is up to date."}
        </p>

        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-white transition-all rounded-full min-w-36 bg-bg-dark hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}