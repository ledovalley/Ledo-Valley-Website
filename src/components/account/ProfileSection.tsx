"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/* ================= TYPES ================= */

interface CustomerProfile {
  _id: string;
  phone: string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
}

/* ================= COMPONENT ================= */

export default function ProfileSection() {
  const { token } = useAuth();

  const [profile, setProfile] =
    useState<CustomerProfile | null>(null);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  /* ================= LOAD PROFILE ================= */

  useEffect(() => {
    if (!token) return;

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
      });
  }, [token]);

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!token) return;

    try {
      setSaving(true);

      const res = await api.put<CustomerProfile>(
        "/customer/profile",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(res.data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return null;

  return (
    <div className="border p-8 rounded-2xl space-y-6">
      <h2 className="text-2xl font-semibold text-text-primary font-playfair">
        Basic Information
      </h2>

      <div>
        <label className="text-sm text-gray-500">
          Registered Phone
        </label>
        <p className="font-medium mt-1">
          {profile.phone}
        </p>
      </div>

      <div>
        <label className="text-sm text-gray-500">
          Name
        </label>
        <input
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          className="w-full border rounded-full px-4 py-2 mt-1"
          placeholder="Enter your name"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2 bg-bg-dark text-white rounded-full cursor-pointer disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
