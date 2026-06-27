import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "VitaAdmin – Healthcare Platform", template: "%s | VitaAdmin" },
  description: "Vita Healthcare Platform – Super Admin & Admin Management Console",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full bg-vita-bg text-slate-900 antialiased">{children}</body>
    </html>
  );
}
