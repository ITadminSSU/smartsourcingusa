// Root layout passes through to [locale]/layout.tsx (see next-intl App Router setup)
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
