import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Apex Markup Studio",
  description:
    "Premium multi-channel markup calculator delivering precise pricing intelligence for modern businesses.",
  metadataBase: new URL("https://agentic-ef5a3fa5.vercel.app"),
  openGraph: {
    title: "Apex Markup Studio",
    description:
      "Craft bulletproof sell prices, margins, and markup strategies across web, Excel, and Google Sheets.",
    url: "https://agentic-ef5a3fa5.vercel.app",
    siteName: "Apex Markup Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Apex Markup Studio",
    description:
      "Elegant markup calculator suite for finance, sales, and operations teams.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
