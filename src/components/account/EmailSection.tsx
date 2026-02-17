"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function EmailSection() {
  const { token } = useAuth();

  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/customer/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEmail(res.data.email || "");
        setVerified(res.data.emailVerified);
      });
  }, [token]);

  const handleUpdateEmail = async () => {
    try {
      setLoading(true);

      await api.put(
        "/customer/profile/email",
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Verification email sent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-8 rounded-2xl space-y-6">
      <h2 className="text-2xl font-semibold font-playfair text-text-primary">
        Email
      </h2>

      <div className="flex items-center gap-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border rounded-full px-4 py-2"
          placeholder="Enter email"
        />

        <button
          onClick={handleUpdateEmail}
          disabled={loading}
          className="px-6 py-2 bg-bg-dark text-white cursor-pointer rounded-full"
        >
          {loading ? "Sending..." : "Save"}
        </button>
      </div>

      {email && (
        <p className="text-sm">
          Status:{" "}
          {verified ? (
            <span className="text-green-600">
              Verified
            </span>
          ) : (
            <span className="text-red-500">
              Not Verified
            </span>
          )}
        </p>
      )}
    </div>
  );
}
