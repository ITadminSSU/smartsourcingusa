import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Admin — Smart Sourcing USA",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-gray-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
