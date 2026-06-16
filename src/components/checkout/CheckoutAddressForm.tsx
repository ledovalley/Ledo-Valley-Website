"use client";

import { useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface Props {
  token: string | null;
  onSuccess: (newAddressId: string) => void;
  onCancel: () => void;
}

export default function CheckoutAddressForm({
  token,
  onSuccess,
  onCancel,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  /* ================= HANDLE CHANGE ================= */

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  /* ================= VALIDATION ================= */

  const errors = {
    name:
      form.name.trim().length < 2
        ? "Enter valid full name"
        : "",
    phone:
      !/^[0-9]{10}$/.test(form.phone)
        ? "Enter valid 10 digit phone number"
        : "",
    addressLine1:
      form.addressLine1.trim().length < 5
        ? "Enter complete address"
        : "",
    city: !form.city.trim() ? "City required" : "",
    state: !form.state.trim() ? "State required" : "",
    pincode:
      !/^[0-9]{6}$/.test(form.pincode)
        ? "Enter valid 6 digit pincode"
        : "",
  };

  const isValid =
    !errors.name &&
    !errors.phone &&
    !errors.addressLine1 &&
    !errors.city &&
    !errors.state &&
    !errors.pincode;

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!isValid || !token) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
        "/customer/addresses",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const addresses = res.data;
      const newAddress = addresses[addresses.length - 1];

      toast.success("Address saved successfully");

      onSuccess(newAddress._id);
    } catch (error: unknown) {
      const axiosError =
        error as AxiosError<{ message: string }>;

      toast.error(
        axiosError.response?.data?.message ||
        "Failed to add address"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ================= STYLES ================= */

  const inputStyle =
    "w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-bg-dark/40 focus:border-bg-dark transition";

  const labelStyle =
    "block text-sm font-medium mb-2 text-gray-700";

  const errorStyle =
    "text-xs text-red-500 mt-1";

  /* ================= UI ================= */

  return (
    <div className="flex flex-col min-h-0">
      <div className="space-y-6 flex-1 overflow-y-auto px-6 py-6">

      {/* FULL NAME + PHONE */}
      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className={labelStyle}>
            Full Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={() => handleBlur("name")}
            className={`${inputStyle} ${touched.name && errors.name
                ? "border-red-400"
                : ""
              }`}
          />
          {touched.name && errors.name && (
            <p className={errorStyle}>{errors.name}</p>
          )}
        </div>

        <div>
          <label className={labelStyle}>
            Mobile Number *
          </label>
          <input
            name="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.phone}
            onChange={handleChange}
            onBlur={() => handleBlur("phone")}
            className={`${inputStyle} ${touched.phone && errors.phone
                ? "border-red-400"
                : ""
              }`}
          />
          {touched.phone && errors.phone && (
            <p className={errorStyle}>{errors.phone}</p>
          )}
        </div>
      </div>

      {/* ADDRESS LINE 1 */}
      <div>
        <label className={labelStyle}>
          Address Line 1 *
        </label>
        <input
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          onBlur={() => handleBlur("addressLine1")}
          className={`${inputStyle} ${touched.addressLine1 &&
              errors.addressLine1
              ? "border-red-400"
              : ""
            }`}
        />
        {touched.addressLine1 &&
          errors.addressLine1 && (
            <p className={errorStyle}>
              {errors.addressLine1}
            </p>
          )}
      </div>

      {/* ADDRESS LINE 2 */}
      <div>
        <label className={labelStyle}>
          Landmark (Optional)
        </label>
        <input
          name="addressLine2"
          value={form.addressLine2}
          onChange={handleChange}
          className={inputStyle}
        />
      </div>

      {/* CITY / STATE / PINCODE */}
      <div className="grid md:grid-cols-3 gap-5">

        <div>
          <label className={labelStyle}>
            City *
          </label>
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            onBlur={() => handleBlur("city")}
            className={`${inputStyle} ${touched.city && errors.city
                ? "border-red-400"
                : ""
              }`}
          />
          {touched.city && errors.city && (
            <p className={errorStyle}>{errors.city}</p>
          )}
        </div>

        <div>
          <label className={labelStyle}>
            State *
          </label>
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            onBlur={() => handleBlur("state")}
            className={`${inputStyle} ${touched.state && errors.state
                ? "border-red-400"
                : ""
              }`}
          />
          {touched.state && errors.state && (
            <p className={errorStyle}>{errors.state}</p>
          )}
        </div>

        <div>
          <label className={labelStyle}>
            Pincode *
          </label>
          <input
            name="pincode"
            inputMode="numeric"
            maxLength={6}
            value={form.pincode}
            onChange={handleChange}
            onBlur={() => handleBlur("pincode")}
            className={`${inputStyle} ${touched.pincode && errors.pincode
                ? "border-red-400"
                : ""
              }`}
          />
          {touched.pincode &&
            errors.pincode && (
              <p className={errorStyle}>
                {errors.pincode}
              </p>
            )}
        </div>
      </div>

      {/* DEFAULT ADDRESS TOGGLE */}
      <div className="flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={form.isDefault}
          onChange={handleChange}
          className="w-4 h-4 accent-bg-dark cursor-pointer"
        />
        <label
          htmlFor="isDefault"
          className="text-sm text-gray-700 cursor-pointer"
        >
          Make this my default delivery address
        </label>
      </div>

      </div>

      {/* ACTIONS */}
      <div className="flex-none flex justify-end gap-4 px-6 py-5 border-t border-black/5 bg-bg-surface/50">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-sm cursor-pointer font-medium text-gray-600 hover:text-black transition"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading || !isValid}
          className="px-6 py-3 bg-brand-primary text-white rounded-xl cursor-pointer disabled:cursor-not-allowed font-medium disabled:opacity-50 flex items-center gap-2 transition hover:bg-brand-primary/90"
        >
          {loading && (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
          )}
          {loading ? "Saving..." : "Save Address"}
        </button>
      </div>
    </div>
  );
}
