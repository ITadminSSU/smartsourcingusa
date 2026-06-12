"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { submitContact } from "./submitContact";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  preferredDays: string;
  preferredTime: string;
  timezone: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  fullName: "",
  email: "",
  phone: "",
  companyName: "",
  preferredDays: "",
  preferredTime: "",
  timezone: "",
  notes: "",
};

export default function RequestCallForm() {
  const t = useTranslations("contact.schedule");
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const preferredTimeOptions = t.raw("fields.preferredTime.options") as string[];
  const timezoneOptions = t.raw("fields.timezone.options") as string[];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    try {
      await submitContact({
        type: "schedule",
        ...form,
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

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#2c84c4]/40 focus:border-[#2c84c4] outline-none transition";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg bg-[#2c84c4]/5 border border-[#2c84c4]/20 px-4 py-3 text-sm text-gray-700">
        {t("howItWorks")}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label htmlFor="schedule-fullName" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.fullName.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="schedule-fullName"
            required
            type="text"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className={inputClass}
            placeholder={t("fields.fullName.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="schedule-email" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.email.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="schedule-email"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
            placeholder={t("fields.email.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="schedule-phone" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.phone.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="schedule-phone"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            placeholder={t("fields.phone.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="schedule-company" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.companyName.label")}
          </label>
          <input
            id="schedule-company"
            type="text"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            className={inputClass}
            placeholder={t("fields.companyName.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="preferredDays" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.preferredDays.label")} <span className="text-red-500">*</span>
          </label>
          <input
            id="preferredDays"
            required
            type="text"
            value={form.preferredDays}
            onChange={(e) => setForm({ ...form, preferredDays: e.target.value })}
            className={inputClass}
            placeholder={t("fields.preferredDays.placeholder")}
          />
        </div>
        <div>
          <label htmlFor="preferredTime" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.preferredTime.label")} <span className="text-red-500">*</span>
          </label>
          <select
            id="preferredTime"
            required
            value={form.preferredTime}
            onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="">{t("fields.preferredTime.placeholder")}</option>
            {preferredTimeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="timezone" className="block text-sm font-semibold text-gray-900 mb-1.5">
            {t("fields.timezone.label")} <span className="text-red-500">*</span>
          </label>
          <select
            id="timezone"
            required
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className={`${inputClass} bg-white`}
          >
            <option value="">{t("fields.timezone.placeholder")}</option>
            {timezoneOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="schedule-notes" className="block text-sm font-semibold text-gray-900 mb-1.5">
          {t("fields.notes.label")}
        </label>
        <textarea
          id="schedule-notes"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className={`${inputClass} resize-y`}
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
