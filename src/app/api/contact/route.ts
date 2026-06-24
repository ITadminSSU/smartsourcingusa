import { NextResponse } from "next/server";
import { buildEmailBody, fieldRow, sendContactEmail } from "@/lib/email";

type InquiryPayload = {
  type: "inquiry";
  fullName: string;
  email: string;
  phone?: string;
  companyName: string;
  tradeScope: string;
  estimatorsNeeded: string;
  software: string[];
  otherSoftware?: string;
  notes?: string;
  website?: string;
};

type SchedulePayload = {
  type: "schedule";
  fullName: string;
  email: string;
  phone: string;
  companyName?: string;
  preferredTime: string;
  timezone: string;
  preferredDays: string;
  notes?: string;
  website?: string;
};

type ContactPayload = InquiryPayload | SchedulePayload;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateInquiry(body: InquiryPayload): string | null {
  if (body.website) return "spam";
  if (!isNonEmptyString(body.fullName)) return "Full name is required";
  if (!isNonEmptyString(body.email)) return "Email is required";
  if (!isNonEmptyString(body.companyName)) return "Company name is required";
  if (!isNonEmptyString(body.tradeScope)) return "Trade / scope is required";
  if (!isNonEmptyString(body.estimatorsNeeded)) return "Estimators needed is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Invalid email address";
  return null;
}

function validateSchedule(body: SchedulePayload): string | null {
  if (body.website) return "spam";
  if (!isNonEmptyString(body.fullName)) return "Full name is required";
  if (!isNonEmptyString(body.email)) return "Email is required";
  if (!isNonEmptyString(body.phone)) return "Phone is required";
  if (!isNonEmptyString(body.preferredTime)) return "Preferred time is required";
  if (!isNonEmptyString(body.timezone)) return "Timezone is required";
  if (!isNonEmptyString(body.preferredDays)) return "Preferred days are required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Invalid email address";
  return null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactPayload;

    if (body.type === "inquiry") {
      const error = validateInquiry(body);
      if (error === "spam") return NextResponse.json({ ok: true });
      if (error) return NextResponse.json({ error }, { status: 400 });

      const softwareList = [
        ...body.software,
        body.otherSoftware?.trim() ? `Other: ${body.otherSoftware.trim()}` : "",
      ]
        .filter(Boolean)
        .join(", ");

      const rows = [
        fieldRow("Form Type", "Client Inquiry"),
        fieldRow("Full Name", body.fullName),
        fieldRow("Email", body.email),
        fieldRow("Phone", body.phone ?? ""),
        fieldRow("Company", body.companyName),
        fieldRow("Trade / Scope", body.tradeScope),
        fieldRow("Estimators Needed", body.estimatorsNeeded),
        fieldRow("Software Used", softwareList || "None selected"),
        fieldRow("Additional Details", body.notes ?? ""),
      ].join("");

      const text = [
        "New Client Inquiry",
        `Full Name: ${body.fullName}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone ?? "—"}`,
        `Company: ${body.companyName}`,
        `Trade / Scope: ${body.tradeScope}`,
        `Estimators Needed: ${body.estimatorsNeeded}`,
        `Software Used: ${softwareList || "None selected"}`,
        `Additional Details: ${body.notes ?? "—"}`,
      ].join("\n");

      await sendContactEmail({
        subject: `New Client Inquiry — ${body.companyName}`,
        html: buildEmailBody("New Client Inquiry", rows),
        text,
        replyTo: body.email,
      });
    } else if (body.type === "schedule") {
      const error = validateSchedule(body);
      if (error === "spam") return NextResponse.json({ ok: true });
      if (error) return NextResponse.json({ error }, { status: 400 });

      const rows = [
        fieldRow("Form Type", "Schedule a Call Request"),
        fieldRow("Full Name", body.fullName),
        fieldRow("Email", body.email),
        fieldRow("Phone", body.phone),
        fieldRow("Company", body.companyName ?? ""),
        fieldRow("Preferred Days", body.preferredDays),
        fieldRow("Preferred Time", body.preferredTime),
        fieldRow("Timezone", body.timezone),
        fieldRow("Notes", body.notes ?? ""),
      ].join("");

      const text = [
        "Schedule a Call Request",
        `Full Name: ${body.fullName}`,
        `Email: ${body.email}`,
        `Phone: ${body.phone}`,
        `Company: ${body.companyName ?? "—"}`,
        `Preferred Days: ${body.preferredDays}`,
        `Preferred Time: ${body.preferredTime}`,
        `Timezone: ${body.timezone}`,
        `Notes: ${body.notes ?? "—"}`,
      ].join("\n");

      await sendContactEmail({
        subject: `Call Request — ${body.fullName}`,
        html: buildEmailBody("Schedule a Call Request", rows),
        text,
        replyTo: body.email,
      });
    } else {
      return NextResponse.json({ error: "Invalid form type" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return NextResponse.json(
      { error: "Unable to send message. Please email sales@smartsourcingusa.com directly." },
      { status: 500 }
    );
  }
}
