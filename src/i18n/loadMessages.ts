import type { AbstractIntlMessages } from "next-intl";

const EXTRA_NAMESPACES = [
  "common",
  "faq",
  "blog",
  "privacy",
  "terms",
  "services",
  "caseStudies",
  "howItWorks",
  "ourTeam",
  "roi",
  "careers",
] as const;

export async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  const base = (await import(`../../messages/${locale}.json`)).default as AbstractIntlMessages;
  const merged: AbstractIntlMessages = { ...base };

  await Promise.all(
    EXTRA_NAMESPACES.map(async (name) => {
      try {
        const part = (await import(`../../messages/${locale}/${name}.json`)).default as AbstractIntlMessages;
        Object.assign(merged, part);
      } catch {
        // namespace file optional until added for this locale
      }
    })
  );

  return merged;
}
