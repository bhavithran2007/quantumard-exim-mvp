import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantumard EXIM OS",
  description: "International Trade ERP & CRM Platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
