# Spanish / English (i18n) — Setup Guide

## URLs

- **English (default):** `https://www.smartsourcingusa.com/`
- **Spanish:** `https://www.smartsourcingusa.com/es/`
- **EN | ES toggle** in the header (desktop and mobile)

## Fully translated pages

Home, About Us, Contact, FAQ, Blog, Privacy Policy, Terms of Service, all four service pages, How It Works, Case Studies, Our Team, ROI hub (calculator, pricing, FAQ tabs), and **Careers** (coming-soon placeholder).

Header, footer, and navigation follow the selected locale.

## Test locally

```bash
npm install
npm run dev
```

Examples:

- http://localhost:3000/ — English home
- http://localhost:3000/es — Spanish home
- http://localhost:3000/es/careers — Spanish careers (coming soon)
- http://localhost:3000/es/faq — Spanish FAQ

Click **ES** / **EN** in the header to switch language on the same page.

## Edit translations

- `messages/en.json` and `messages/es.json` — core strings (nav, footer, home, about, contact)
- `messages/en/*.json` and `messages/es/*.json` — per-page namespaces (`faq`, `blog`, `services`, `caseStudies`, `howItWorks`, `ourTeam`, `roi`, `careers`, etc.)

After editing, save and redeploy.

## Before you deploy

```bash
npm run build
```

If the build succeeds, push to GitHub. Vercel will redeploy automatically.

## Careers / Breezy

The `/careers` route shows a coming-soon message in both languages. When you connect Breezy (or another ATS), replace `src/app/[locale]/careers/page.tsx` with your job board embed or link.
