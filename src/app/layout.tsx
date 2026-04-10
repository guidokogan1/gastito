import type { Metadata } from "next";

import { assertPublicAppEnv } from "@/lib/env";

import "./globals.css";

assertPublicAppEnv();

export const metadata: Metadata = {
  title: "Hogar Finanzas",
  description: "Finanzas familiares simples, compartibles y en ARS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
