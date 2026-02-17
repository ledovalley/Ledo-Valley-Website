"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export interface AddressInput {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

interface Props {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<AddressInput>;
  addressId?: string;
}

export default function AddressForm({
  onSuccess,
  onCancel,
  initialData,
  addressId,
}: Props) {
  const { token } = useAuth();

  const [form, setForm] = useState<AddressInput>({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    pincode: initialData?.pincode || "",
    isDefault: initialData?.isDefault || false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressInput, string>>
  >({});

  const [saving, setSaving] = useState(false);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name as keyof AddressInput]:
        type === "checkbox" ? checked : value,
    }));

    // Clear error when typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  /* ================= VALIDATION ================= */

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.name.trim())
      newErrors.name = "Full name is required";

    if (!form.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = "Enter valid 10 digit phone";

    if (!form.addressLine1.trim())
      newErrors.addressLine1 = "Address Line 1 is required";

    if (!form.city.trim())
      newErrors.city = "City is required";

    if (!form.state.trim())
      newErrors.state = "State is required";

    if (!form.pincode.trim())
      newErrors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(form.pincode))
      newErrors.pincode = "Enter valid 6 digit pincode";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!token) return;

    const isValid = validate();
    if (!isValid) return;

    try {
      setSaving(true);

      const payload = {
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2?.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
      };

      if (addressId) {
        await api.put(
          `/customer/addresses/${addressId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Address updated");
      } else {
        await api.post(
          "/customer/addresses",
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Address added");
      }

      onSuccess();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  /* ================= INPUT RENDER ================= */

  const renderInput = (
    label: string,
    name: keyof AddressInput,
    type: string = "text"
  ) => (
    <div className="space-y-1">
      <label className="text-sm font-medium">
        {label} <span className="text-red-500">*</span>
      </label>

      <input
        type={type}
        name={name}
        value={String(form[name] ?? "")}
        onChange={handleChange}
        className={`w-full border rounded-full px-4 py-2 transition
          ${
            errors[name]
              ? "border-red-500 focus:ring-red-500"
              : "focus:ring-black"
          }
        `}
      />

      {errors[name] && (
        <p className="text-xs text-red-500">
          {errors[name]}
        </p>
      )}
    </div>
  );

  /* ================= UI ================= */

  return (
    <div className="border p-8 rounded-2xl space-y-6 shadow-2xl">
      <h3 className="text-xl font-semibold">
        {addressId ? "Edit Address" : "Add Address"}
      </h3>

      {renderInput("Full Name", "name")}
      {renderInput("Phone", "phone", "tel")}
      {renderInput("Address Line 1", "addressLine1")}
      {renderInput("Address Line 2", "addressLine2")}
      {renderInput("City", "city")}
      {renderInput("State", "state")}
      {renderInput("Pincode", "pincode", "number")}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
        />
        Set as default address
      </label>

      <div className="flex gap-4 pt-4">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-6 py-3 bg-bg-dark text-white rounded-full text-sm cursor-pointer hover:bg-bg-dark/90 transition disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Address"}
        </button>

        <button
          onClick={onCancel}
          className="px-6 py-3 border rounded-full text-sm cursor-pointer hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
