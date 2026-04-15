"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AddressForm, { AddressInput } from "./AddressForm";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  Home,
  Loader2,
} from "lucide-react";

/* ================= TYPES ================= */

interface Address extends AddressInput {
  _id: string;
  isDefault: boolean;
}

/* ================= HELPERS ================= */

function formatAddress(addr: Address) {
  return [
    addr.addressLine1,
    addr.addressLine2,
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");
}

/* ================= COMPONENT ================= */

export default function AddressSection() {
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultingId, setDefaultingId] = useState<string | null>(null);

  /* ================= LOAD ADDRESSES ================= */

  const loadAddresses = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await api.get<Address[]>("/customer/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAddresses(res.data);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!token) return;

    try {
      setDeletingId(id);

      await api.delete(`/customer/addresses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Address removed");
      loadAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  /* ================= SET DEFAULT ================= */

  const handleSetDefault = async (id: string) => {
    if (!token) return;

    try {
      setDefaultingId(id);

      await api.put(
        `/customer/addresses/${id}/default`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Default address updated");
      loadAddresses();
    } catch {
      toast.error("Failed to update default address");
    } finally {
      setDefaultingId(null);
    }
  };

  /* ================= FORM SUCCESS ================= */

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingAddress(null);
    loadAddresses();
  };

  /* ================= UI ================= */

  return (
    <section className="rounded-[28px] border border-black/5 bg-bg-surface p-5 shadow-sm sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 pb-5 border-b border-black/5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-neutral-100 text-neutral-600">
            <MapPin className="h-3.5 w-3.5" />
            Saved addresses
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
            Addresses
          </h2>

          <p className="mt-1 text-sm text-neutral-500">
            Manage your delivery addresses and choose a default address for faster checkout.
          </p>
        </div>

        {!formOpen && (
          <button
            onClick={() => {
              setEditingAddress(null);
              setFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-2xl bg-bg-dark hover:bg-neutral-800"
          >
            <Plus className="block w-4 h-4 sm:hidden lg:block" />
            Add new address
          </button>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {loading && (
          <div className="grid gap-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="p-5 border rounded-3xl border-neutral-200 bg-neutral-50 animate-pulse"
              >
                <div className="w-40 h-5 mb-4 rounded bg-neutral-200" />
                <div className="space-y-2">
                  <div className="w-full h-4 rounded bg-neutral-200" />
                  <div className="w-4/5 h-4 rounded bg-neutral-200" />
                  <div className="w-1/3 h-4 rounded bg-neutral-200" />
                </div>
                <div className="flex gap-2 mt-5">
                  <div className="h-9 w-28 rounded-xl bg-neutral-200" />
                  <div className="w-20 h-9 rounded-xl bg-neutral-200" />
                  <div className="w-20 h-9 rounded-xl bg-neutral-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && formOpen && (
          <div className="p-4 border rounded-3xl border-border-muted/20 bg-amber-50/50 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                  {editingAddress ? "Edit address" : "Add a new address"}
                </h3>
                <p className="text-sm text-neutral-500">
                  Fill in the details below and save your address.
                </p>
              </div>
            </div>

            <AddressForm
              initialData={editingAddress || undefined}
              addressId={editingAddress?._id}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setFormOpen(false);
                setEditingAddress(null);
              }}
            />
          </div>
        )}

        {!loading && !formOpen && addresses.length === 0 && (
          <div className="rounded-[28px] border border-dashed border-neutral-300 bg-neutral-50 px-6 py-12 text-center">
            <div className="flex items-center justify-center mx-auto bg-white rounded-full shadow-sm h-14 w-14 ring-1 ring-black/5">
              <Home className="w-6 h-6 text-neutral-500" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-neutral-900">
              No saved addresses yet
            </h3>

            <p className="max-w-md mx-auto mt-2 text-sm leading-6 text-neutral-500">
              Add your first delivery address to make checkout faster and keep your shipping details ready.
            </p>

            <button
              onClick={() => setFormOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 mt-5 text-sm font-medium text-white transition rounded-2xl bg-neutral-900 hover:bg-neutral-800"
            >
              <Plus className="w-4 h-4" />
              Add address
            </button>
          </div>
        )}

        {!loading && !formOpen && addresses.length > 0 && (
          <div className="grid gap-4">
            {addresses.map((addr) => {
              const isDeleting = deletingId === addr._id;
              const isDefaulting = defaultingId === addr._id;

              return (
                <div
                  key={addr._id}
                  className={`rounded-3xl border p-5 transition sm:p-6 ${addr.isDefault
                      ? "border-border-muted/20 bg-amber-50/40 shadow-[0_8px_24px_rgba(0,0,0,0.04)]"
                      : "border-black/5 bg-neutral-50 hover:bg-white"
                    }`}
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-neutral-900">
                          {addr.name}
                        </h3>

                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-bg-dark px-2.5 py-1 text-[11px] font-medium text-white">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Default
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-neutral-600">
                        <p className="leading-6">{formatAddress(addr)}</p>

                        <div className="inline-flex items-center gap-2 text-neutral-500">
                          <Phone className="w-4 h-4" />
                          <span>{addr.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      {!addr.isDefault && (
                        <button
                          onClick={() => handleSetDefault(addr._id)}
                          disabled={isDefaulting}
                          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition border rounded-xl border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 disabled:opacity-60"
                        >
                          {isDefaulting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                          Set default
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingAddress(addr);
                          setFormOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition bg-white border rounded-xl border-black/10 text-neutral-700 hover:bg-neutral-100"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(addr._id)}
                        disabled={isDeleting}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 transition border border-red-200 rounded-xl bg-red-50 hover:bg-red-100 disabled:opacity-60"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}