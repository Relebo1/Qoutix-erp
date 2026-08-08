import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { initDb } from "@/lib/db";

await initDb();

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Quotix — Create Quotes. Manage Clients. Get Paid Faster.",
  description:
    "Quotix is the all-in-one platform for freelancers, agencies, and small businesses to create professional quotations, invoices, and manage clients.",
  keywords: ["quotation software", "invoice management", "client management", "freelancer tools", "small business"],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>{children}</body>
    </html>
  );
}
