"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { CheckCircle2, Loader2, MapPinHouse } from "lucide-react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name as keyof AddressInput]:
        type === "checkbox" ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";

    if (!form.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10 digit phone";
    }

    if (!form.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }

    if (!form.city.trim()) newErrors.city = "City is required";

    if (!form.state.trim()) newErrors.state = "State is required";

    if (!form.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Enter valid 6 digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
        await api.put(`/customer/addresses/${addressId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Address updated");
      } else {
        await api.post("/customer/addresses", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Address added");
      }

      onSuccess();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const inputBase =
    "w-full rounded-2xl border bg-bg-page px-4 py-3 text-sm text-text-primary outline-none transition placeholder:text-text-secondary/70 focus:border-border-muted focus:ring-2 focus:ring-highlight/30";

  const renderInput = (
    label: string,
    name: keyof AddressInput,
    type: string = "text",
    required: boolean = true,
    placeholder?: string
  ) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required ? (
          <span className="ml-1 text-warning">*</span>
        ) : (
          <span className="ml-1 text-text-secondary">(Optional)</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={String(form[name] ?? "")}
        onChange={handleChange}
        placeholder={placeholder}
        className={`${inputBase} ${errors[name]
            ? "border-warning focus:border-warning focus:ring-warning/20"
            : "border-border-default"
          }`}
      />

      {errors[name] && (
        <p className="text-xs text-warning">{errors[name]}</p>
      )}
    </div>
  );

  return (
    <div className="rounded-[28px] border border-border-muted/10 bg-bg-surface p-5 sm:p-6">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-page text-text-primary">
          <MapPinHouse className="h-5 w-5" />
        </div>

        <div>
          <h3 className="font-playfair text-xl font-semibold text-text-primary">
            {addressId ? "Edit Address" : "Add Address"}
          </h3>
          <p className="mt-1 text-sm text-text-secondary">
            Fill in your delivery details below.
          </p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {renderInput("Full Name", "name", "text", true, "Enter full name")}
        </div>

        <div className="sm:col-span-2">
          {renderInput(
            "Phone",
            "phone",
            "tel",
            true,
            "Enter 10 digit mobile number"
          )}
        </div>

        <div className="sm:col-span-2">
          {renderInput(
            "Address Line 1",
            "addressLine1",
            "text",
            true,
            "House no, street, area"
          )}
        </div>

        <div className="sm:col-span-2">
          {renderInput(
            "Address Line 2",
            "addressLine2",
            "text",
            false,
            "Apartment, landmark, etc."
          )}
        </div>

        <div>
          {renderInput("City", "city", "text", true, "City")}
        </div>

        <div>
          {renderInput("State", "state", "text", true, "State")}
        </div>

        <div className="sm:col-span-2">
          {renderInput("Pincode", "pincode", "text", true, "6 digit pincode")}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border-default bg-bg-page p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-border-muted accent-brand-primary"
          />

          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
              <CheckCircle2 className="h-4 w-4 text-text-primary" />
              Set as default address
            </div>
            <p className="mt-1 text-xs text-text-secondary">
              This address will be selected automatically during checkout.
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-bg-dark px-6 py-3 text-sm font-medium text-text-on-dark transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Saving..." : addressId ? "Update Address" : "Save Address"}
        </button>

        <button
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center justify-center rounded-2xl border border-border-muted bg-bg-page px-6 py-3 text-sm font-medium text-text-primary transition hover:bg-bg-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}