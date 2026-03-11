import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Collector.shop - Prototype v1",
  description: "Socle initial du frontend Collector.shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
