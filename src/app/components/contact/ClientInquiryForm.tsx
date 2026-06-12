"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "./submitContact";

const SOFTWARE_KEYS = [
  "planSwift",
  "bluebeam",
  "hcssHeavyBid",
  "procore",
  "b2w",
  "measureSquare",
  "googleEarthPro",
  "excel",
  "other",
] as const;

type SoftwareKey = (typeof SOFTWARE_KEYS)[number];

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  tradeScope: string;
  estimatorsNeeded: string;
  software: SoftwareKey[];
  otherSoftware: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  tradeScope: "",
  estimatorsNeeded: "",
  software: [],
  otherSoftware: "",
  notes: "",
};

export default function ClientInquiryForm() {
  const t = useTranslations("contact.inquiry");
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const estimatorOptions = t.raw("fields.estimatorsNeeded.options") as string[];
  const tradeOptions = t.raw("fields.tradeScope.options") as string[];

  const toggleSoftware = (key: SoftwareKey) => {
    setForm((prev) => ({
      ...prev,
      software: prev.software.includes(key)
        ? prev.software.filter((s) => s !== key)
        : [...prev.software, key],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    const selectedSoftware = form.software.map((key) => t(`software.${key}`));

    try {
      await submitContact({
        type: "inquiry",
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        companyName: form.companyName,
        tradeScope: form.tradeScope,
        estimatorsNeeded: form.estimatorsNeeded,
        software: selectedSoftware,
        otherSoftware: form.software.includes("other") ? form.otherSoftware : "",
        notes: form.notes,
        website: "",
      });

      setStatus("success");
      setForm(INITIAL_STATE);
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-lg border border-[#2c84c4]/30 bg-[#2c84c4]/5 p-8 text-center">
        <div className="w-14 h-14 bg-[#2c84c4] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t("success.title")}</h3>
        <p className="text-gray-600 mb-6">{t("success.description")}</p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="text-[#2c84c4] font-semibold hover:text-[#2371a8] transition-colors"
        >
          {t("success.submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.fullName.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            required
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition"
            placeholder={t("fields.fullName.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.email.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition"
            placeholder={t("fields.email.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.phone.label")}
          </label>
          <input
            id="phone"
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition"
            placeholder={t("fields.phone.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="companyName" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.companyName.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="companyName"
            required
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition"
            placeholder={t("fields.companyName.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="tradeScope" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.tradeScope.label")} <span className="text-red-500">*</span>
          </label>
          <select
            id="tradeScope"
            required
            value={form.tradeScope}
            onChange={(e) => setForm({ ...form, tradeScope: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition bg-white"
          >
            <option value="">{t("fields.tradeScope.placeholder")}</option>
            {tradeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="estimatorsNeeded" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.estimatorsNeeded.label")} <span className="text-red-500">*</span>
          </label>
          <select
            id="estimatorsNeeded"
            required
            value={form.estimatorsNeeded}
            onChange={(e) => setForm({ ...form, estimatorsNeeded: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition bg-white"
          >
            <option value="">{t("fields.estimatorsNeeded.placeholder")}</option>
            {estimatorOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-900 mb-3">
          {t("fields.software.label")}
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SOFTWARE_KEYS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 p-3 rounded-md border border-gray-200 hover:border-[#2c84c4]/40 hover:bg-[#2c84c4]/5 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={form.software.includes(key)}
                onChange={() => toggleSoftware(key)}
                className="w-4 h-4 accent-[#2c84c4] flex-shrink-0"
              />
              <span className="text-sm text-gray-700">{t(`software.${key}`)}</span>
            </label>
          ))}
        </div>
        {form.software.includes("other") && (
          <input
            type="text"
            value={form.otherSoftware}
            onChange={(e) => setForm({ ...form, otherSoftware: e.target.value })}
            className="mt-3 w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition"
            placeholder={t("fields.software.otherPlaceholder")}
          />
        )}
      </fieldset>

      <div>
        <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-1.5">
          {t("fields.notes.label")}
        </label>
        <textarea
          id="notes"
          rows={4}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition resize-y"
          placeholder={t("fields.notes.placeholder")}
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3">
          {t("error")}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full sm:w-auto px-8 py-3 bg-[#2c84c4] text-white rounded-md font-semibold hover:bg-[#2371a8] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
