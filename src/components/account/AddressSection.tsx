"use client";

import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import AddressForm, { AddressInput } from "./AddressForm";

/* ================= TYPES ================= */

interface Address extends AddressInput {
  _id: string;
  isDefault: boolean;
}

/* ================= COMPONENT ================= */

export default function AddressSection() {
  const { token } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<Address | null>(null);

  /* ================= LOAD ADDRESSES ================= */

  const loadAddresses = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);

      const res = await api.get<Address[]>(
        "/customer/addresses",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      await api.delete(
        `/customer/addresses/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Address removed");
      loadAddresses();
    } catch {
      toast.error("Failed to delete address");
    }
  };

  /* ================= SET DEFAULT ================= */

  const handleSetDefault = async (id: string) => {
    if (!token) return;

    try {
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
    <div className="border p-8 rounded-2xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold font-playfair text-text-primary">
          Addresses
        </h2>

        {!formOpen && (
          <button
            onClick={() => setFormOpen(true)}
            className="px-4 py-2 bg-bg-dark text-white cursor-pointer rounded-full text-sm"
          >
            Add Address
          </button>
        )}
      </div>

      {loading && (
        <p className="text-sm text-gray-500">
          Loading addresses...
        </p>
      )}

      {!loading && addresses.length === 0 && (
        <p className="text-sm text-gray-500">
          No saved addresses yet.
        </p>
      )}

      {/* ================= FORM ================= */}

      {formOpen && (
        <AddressForm
          initialData={editingAddress || undefined}
          addressId={editingAddress?._id}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setFormOpen(false);
            setEditingAddress(null);
          }}
        />
      )}

      {/* ================= LIST ================= */}

      {!formOpen &&
        addresses.map((addr) => (
          <div
            key={addr._id}
            className="border p-4 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {addr.name}
                  {addr.isDefault && (
                    <span className="ml-2 text-xs bg-black text-white px-2 py-1 rounded-full">
                      Default
                    </span>
                  )}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {addr.addressLine1}
                  {addr.addressLine2 &&
                    `, ${addr.addressLine2}`}
                </p>

                <p className="text-sm text-gray-600">
                  {addr.city}, {addr.state} -{" "}
                  {addr.pincode}
                </p>

                <p className="text-sm text-gray-600">
                  {addr.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-4 text-sm">
              {!addr.isDefault && (
                <button
                  onClick={() =>
                    handleSetDefault(addr._id)
                  }
                  className="text-blue-600 hover:underline"
                >
                  Set Default
                </button>
              )}

              <button
                onClick={() => {
                  setEditingAddress(addr);
                  setFormOpen(true);
                }}
                className="text-gray-700 hover:underline"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(addr._id)
                }
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
