import type { Metadata } from "next";
import DemoNavigation from "@/components/demo-navigation";
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
    <html lang="fr">
      <body>
        <DemoNavigation />
        {children}
      </body>
    </html>
  );
}
