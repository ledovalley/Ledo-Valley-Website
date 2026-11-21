"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

const BUSINESS_TYPES = [
  "Distributor / Super stockist",
  "Wholesaler",
  "Retail shop / Supermarket",
  "Café / Restaurant / Hotel",
  "Office / Corporate supply",
  "Online seller",
  "Other",
];

const VOLUMES = ["Under 50 kg", "50 – 200 kg", "200 – 500 kg", "500 kg – 1 tonne", "Over 1 tonne", "Not sure yet"];

const EMPTY = {
  fullName: "",
  businessName: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  businessType: "",
  monthlyVolume: "",
  areas: "",
  gstin: "",
  message: "",
};

type Fields = typeof EMPTY;

/* Everything the team needs in one readable message (shown in the admin and the alert email). */
const composeMessage = (f: Fields) =>
  [
    "DISTRIBUTOR ENQUIRY",
    `Business: ${f.businessName}`,
    `Type: ${f.businessType || "-"}`,
    `Location: ${f.city}, ${f.state}`,
    `Areas covered: ${f.areas || "-"}`,
    `Expected monthly volume: ${f.monthlyVolume || "-"}`,
    `GSTIN: ${f.gstin || "-"}`,
    `Phone: ${f.phone}`,
    "",
    f.message ? `Message: ${f.message}` : "",
  ]
    .filter((line, i, all) => line !== "" || i < all.length - 1)
    .join("\n")
    .trim();

export default function DistributorForm() {
  const [form, setForm] = useState<Fields>(EMPTY);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const set =
    (name: keyof Fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Please enter a 10-digit phone number so we can call you.");
      return;
    }

    setSending(true);
    try {
      await api.post("/customer/contact", {
        fullName: form.fullName.trim(),
        companyName: form.businessName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        subject: `Distributor enquiry – ${form.businessName.trim()} (${form.city.trim()})`,
        message: composeMessage(form),
      });
      setSent(true);
      setForm(EMPTY);
      try {
        const w = window as unknown as { dataLayer?: unknown[] };
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event: "generate_lead", lead_type: "distributor" });
      } catch {
        // analytics is optional
      }
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(message || "Couldn't send your enquiry. Please try again, or call or WhatsApp us.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="w-full max-w-3xl p-8 text-center border sm:p-10 bg-bg-surface/60 border-border rounded-3xl"
      >
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold font-playfair">Thank you, we&apos;ve got your enquiry</h2>
        <p className="mt-2 text-text-muted">
          Our team will call you within two working days. If it&apos;s urgent, call or WhatsApp us.
        </p>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-3xl p-6 space-y-6 border shadow-sm bg-bg-surface/60 border-border sm:p-10 rounded-3xl"
      noValidate={false}
    >
      <div className="text-center">
        <h2 className="text-2xl font-semibold md:text-3xl font-playfair">Distributor enquiry</h2>
        <p className="mt-2 text-sm text-text-muted">Fields marked * are required.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name *">
          <input className={inputClass} value={form.fullName} onChange={set("fullName")} required autoComplete="name" />
        </Field>
        <Field label="Business name *">
          <input className={inputClass} value={form.businessName} onChange={set("businessName")} required autoComplete="organization" />
        </Field>
        <Field label="Phone / WhatsApp *">
          <input className={inputClass} type="tel" inputMode="tel" value={form.phone} onChange={set("phone")} required autoComplete="tel" />
        </Field>
        <Field label="Email *">
          <input className={inputClass} type="email" value={form.email} onChange={set("email")} required autoComplete="email" />
        </Field>
        <Field label="City / Town *">
          <input className={inputClass} value={form.city} onChange={set("city")} required autoComplete="address-level2" />
        </Field>
        <Field label="State *">
          <input className={inputClass} value={form.state} onChange={set("state")} required autoComplete="address-level1" />
        </Field>
        <Field label="Type of business *">
          <select className={inputClass} value={form.businessType} onChange={set("businessType")} required>
            <option value="" disabled>
              Choose one
            </option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Expected monthly volume">
          <select className={inputClass} value={form.monthlyVolume} onChange={set("monthlyVolume")}>
            <option value="">Choose one</option>
            {VOLUMES.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Areas you supply">
          <input className={inputClass} value={form.areas} onChange={set("areas")} placeholder="e.g. Dibrugarh district, Upper Assam" />
        </Field>
        <Field label="GSTIN (if registered)">
          <input className={inputClass} value={form.gstin} onChange={set("gstin")} maxLength={15} autoCapitalize="characters" />
        </Field>
      </div>

      <Field label="Anything else we should know?">
        <textarea
          className={`${inputClass} resize-none`}
          rows={4}
          value={form.message}
          onChange={set("message")}
          placeholder="Brands you currently sell, shops you reach, what you're looking for…"
        />
      </Field>

      {error && (
        <p role="alert" className="text-sm text-center text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="w-full py-3 font-medium transition rounded-full bg-bg-dark text-text-on-dark hover:opacity-90 disabled:opacity-60"
      >
        {sending ? "Sending…" : "Send enquiry"}
      </button>

      <p className="text-xs text-center text-text-muted">
        We use these details only to reply to your enquiry.
      </p>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
    </label>
  );
}
