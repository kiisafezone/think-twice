import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "THINK TWICE. — Pahami sebelum membeli",
  description:
    "Pahami alasan dan dampak finansial sebelum mengambil keputusan pembelian. Think twice today. Thank yourself tomorrow.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
