import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// Fallback when `/` is requested without proxy handling it first
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
